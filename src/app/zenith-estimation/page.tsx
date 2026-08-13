"use client";

import { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Download, Printer } from "lucide-react";
import ToolHeader from "@/components/Header/Header";

interface EstimateItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
}

function numberToWords(num: number): string {
    if (num <= 0) return "Zero Rupees";
    const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    function convertToWords(n: number): string {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? "-" + a[n % 10] : "");
        if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " And " + convertToWords(n % 100) : "");
        if (n < 1000000) return convertToWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? (n % 1000 < 100 ? " And " : ", ") + convertToWords(n % 1000) : "");
        if (n < 1000000000) return convertToWords(Math.floor(n / 1000000)) + " Million" + (n % 1000000 !== 0 ? ", " + convertToWords(n % 1000000) : "");
        return "";
    }

    const numStr = Math.max(0, num).toFixed(2);
    const [rsStr, pStr] = numStr.split('.');
    let rs = parseInt(rsStr, 10);
    let p = parseInt(pStr, 10);

    let res = convertToWords(rs) + " Rupees";
    if (p > 0) {
        res += " and " + convertToWords(p) + " Paise";
    }
    return res;
}

/** Component for table cell: returns standard Input/Textarea on screen, clean text Div during PDF export */
function EditableCell({
    value,
    onChange,
    multiline = false,
    className = "",
    placeholder = "",
    type = "text",
    align = "left",
    isExportingPDF = false,
}: {
    value: string;
    onChange: (v: string) => void;
    multiline?: boolean;
    className?: string;
    placeholder?: string;
    type?: string;
    align?: "left" | "center" | "right";
    isExportingPDF?: boolean;
}) {
    const textAlign = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

    if (isExportingPDF) {
        return (
            <div className={`text-[13px] font-medium text-black leading-normal py-1 w-full ${textAlign} ${className}`}>
                {value || ""}
            </div>
        );
    }

    if (multiline) {
        return (
            <Textarea
                placeholder={placeholder}
                value={value}
                rows={1}
                onInput={(e) => {
                    e.currentTarget.style.height = "auto";
                    e.currentTarget.style.height = e.currentTarget.scrollHeight + "px";
                }}
                onChange={(e) => onChange(e.target.value)}
                className={`border-none p-1 h-auto min-h-[30px] w-full focus-visible:ring-0 shadow-none resize-none overflow-hidden text-[13px] leading-normal bg-transparent text-black font-medium ${textAlign} ${className}`}
            />
        );
    }

    return (
        <Input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`border-none p-1 h-7 w-full focus-visible:ring-0 rounded-none shadow-none text-[13px] leading-normal bg-transparent text-black font-medium ${textAlign} ${className}`}
        />
    );
}

const ZenithEstimationPage = () => {
    const printRef = useRef<HTMLDivElement>(null);

    const [quotationNumber, setQuotationNumber] = useState("");
    const [quotationDate, setQuotationDate] = useState("");
    const [customerDetails, setCustomerDetails] = useState("");
    const [isExportingPDF, setIsExportingPDF] = useState(false);

    const [items, setItems] = useState<EstimateItem[]>([
        { id: "1", description: "", quantity: 1, unitPrice: 0 },
    ]);

    useEffect(() => {
        const generateNumber = () => {
            return `Z${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
        };
        setQuotationNumber(generateNumber());

        const date = new Date();
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        setQuotationDate(`${dd}-${mm}-${yyyy}`);
    }, []);

    const addItem = () => {
        setItems([
            ...items,
            { id: Date.now().toString(), description: "", quantity: 1, unitPrice: 0 },
        ]);
    };

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter((item) => item.id !== id));
        }
    };

    const updateItem = (id: string, field: keyof EstimateItem, value: string | number) => {
        setItems(
            items.map((item) =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

    const calculateTotal = () => {
        return items.reduce(
            (sum, item) => sum + item.quantity * item.unitPrice,
            0
        );
    };

    const handleDownloadPDF = async () => {
        const element = printRef.current;
        if (!element) return;

        setIsExportingPDF(true);
        await new Promise((resolve) => setTimeout(resolve, 50));

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                scrollY: -window.scrollY,
                windowHeight: element.scrollHeight,
            });

            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const margin = 10; // mm on all four sides
            const contentW = pdfWidth - 2 * margin;
            const contentH = pdfHeight - 2 * margin;

            const canvasPageHeight = Math.floor((canvas.width / contentW) * contentH);

            const containerRect = element.getBoundingClientRect();
            const scaleRatio = canvas.height / element.offsetHeight;

            const breakableElements = Array.from(element.querySelectorAll(".avoid-break")) as HTMLElement[];
            const blockBounds = breakableElements.map((el) => {
                const rect = el.getBoundingClientRect();
                const top = (rect.top - containerRect.top) * scaleRatio;
                const bottom = (rect.bottom - containerRect.top) * scaleRatio;
                return { top, bottom, height: bottom - top };
            });

            const slices: { srcY: number; srcH: number }[] = [];
            let currentY = 0;

            while (currentY < canvas.height - 5) {
                let targetY = currentY + canvasPageHeight;

                if (targetY >= canvas.height) {
                    slices.push({ srcY: currentY, srcH: canvas.height - currentY });
                    break;
                }

                let adjustedY = targetY;
                for (const block of blockBounds) {
                    if (block.top < targetY && block.bottom > targetY) {
                        if (block.top > currentY + 30) {
                            adjustedY = Math.min(adjustedY, block.top);
                        }
                    }
                }

                const srcH = adjustedY - currentY;
                slices.push({ srcY: currentY, srcH });
                currentY = adjustedY;
            }

            for (let pageIndex = 0; pageIndex < slices.length; pageIndex++) {
                if (pageIndex > 0) pdf.addPage();

                const { srcY, srcH } = slices[pageIndex];

                const pageCanvas = document.createElement("canvas");
                pageCanvas.width = canvas.width;
                pageCanvas.height = canvasPageHeight;
                const ctx = pageCanvas.getContext("2d");
                if (!ctx) continue;

                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
                ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);

                pdf.addImage(pageCanvas.toDataURL("image/png"), "PNG", margin, margin, contentW, contentH);
            }

            pdf.save(`${quotationNumber}.pdf`);
        } finally {
            setIsExportingPDF(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 pb-24">
            <ToolHeader brandName="Zenith Automation" title="Zenith Estimation / Quotation" subtitle="Create project quotations" />

            {/* Controls */}
            <div className="max-w-7xl mx-auto mb-6 flex justify-end gap-3">
                <Button onClick={handlePrint} variant="outline">
                    <Printer className="w-4 h-4 mr-2" /> Print
                </Button>
                <Button onClick={handleDownloadPDF}>
                    <Download className="w-4 h-4 mr-2" /> Download PDF
                </Button>
            </div>

            {/* ESTIMATION DOCUMENT */}
            <div
                ref={printRef}
                className="max-w-4xl mx-auto bg-white p-10 text-sm text-black shadow-lg"
                style={{ minHeight: '297mm' }}
            >
                {/* COMPANY HEADER BLOCK */}
                <div className="avoid-break text-center text-xl font-medium py-3">
                    Estimate
                </div>

                {/* Main Header Table */}
                <table className="avoid-break w-full border border-black text-sm border-collapse">
                    <tbody>
                        <tr>
                            <td className="border-r border-black p-4 w-[60%] align-top">
                                <div className="flex gap-4 items-start">
                                    <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center">
                                        <img src="" alt="" className="max-w-full max-h-full" />
                                    </div>
                                    <div className="text-[13px] leading-snug flex flex-col gap-1">
                                        <h1 className="text-xl font-medium uppercase text-black mb-1">
                                            ZENITH AUTOMATION
                                        </h1>
                                        <p>Smart Living, Simplified</p>
                                        <br />
                                        <p>No:64 Murugan Koil Street, North Bharathipuram</p>
                                        <p>Shanmugapuram, Pondicherry - 605009</p>
                                        <p>Phone: +91 93858 20287</p>
                                        <p>Email: zenithautomation1@gmail.com</p>
                                    </div>
                                </div>
                            </td>
                            <td className="w-[40%] p-0 align-top">
                                <table className="w-full h-full border-collapse">
                                    <tbody>
                                        <tr>
                                            <td className="border-b border-black p-3 w-1/2 align-top">
                                                <p className="text-gray-800 text-[11px] mb-1 font-medium">Quotation No</p>
                                                {isExportingPDF ? (
                                                    <p className="font-semibold text-[13px] text-black">{quotationNumber}</p>
                                                ) : (
                                                    <Input
                                                        value={quotationNumber}
                                                        onChange={(e) => setQuotationNumber(e.target.value)}
                                                        className="border border-gray-300 rounded px-1.5 h-7 font-semibold focus-visible:ring-1 text-[13px] w-full bg-white"
                                                    />
                                                )}
                                            </td>
                                            <td className="border-b border-l border-black p-3 w-1/2 align-top">
                                                <p className="text-gray-800 text-[11px] mb-1 font-medium">Quotation Date</p>
                                                {isExportingPDF ? (
                                                    <p className="font-semibold text-[13px] text-black">{quotationDate}</p>
                                                ) : (
                                                    <Input
                                                        type="text"
                                                        value={quotationDate}
                                                        onChange={(e) => setQuotationDate(e.target.value)}
                                                        className="border border-gray-300 rounded px-1.5 h-7 font-semibold focus-visible:ring-1 text-[13px] w-full bg-white"
                                                    />
                                                )}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={2} className="p-3 h-full min-h-[60px] align-top">
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table className="avoid-break w-full border-x border-b border-black text-sm mb-4 border-collapse">
                    <tbody>
                        <tr>
                            <td className="p-3 align-top min-h-[60px]">
                                <p className="text-gray-800 text-[11px] mb-1 font-medium">Estimate For</p>
                                {isExportingPDF ? (
                                    <div className="text-[13px] font-medium text-black leading-normal whitespace-pre-wrap">{customerDetails || " "}</div>
                                ) : (
                                    <Textarea
                                        placeholder="Customer Details"
                                        value={customerDetails}
                                        onChange={(e) => setCustomerDetails(e.target.value)}
                                        onInput={(e) => {
                                            e.currentTarget.style.height = "auto";
                                            e.currentTarget.style.height = e.currentTarget.scrollHeight + "px";
                                        }}
                                        className="border border-gray-300 rounded p-1.5 min-h-[40px] font-medium focus-visible:ring-1 text-[13px] w-full bg-white text-black"
                                    />
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* ITEMS TABLE */}
                <table className="avoid-break w-full border-l border-r border-t border-black text-sm border-collapse">
                    <thead className="bg-[#fcfcfc]">
                        <tr>
                            <th className="border-b border-r border-black p-2 text-center w-[5%] text-[13px] font-medium align-middle border-l-[#fcfcfc] border-l-0">#</th>
                            <th className="border-b border-r border-black p-2 text-left w-[40%] text-[13px] font-medium align-middle">Description</th>
                            <th className="border-b border-r border-black p-2 text-center w-[15%] text-[13px] font-medium align-middle">Qty</th>
                            <th className="border-b border-r border-black p-2 text-right w-[15%] text-[13px] font-medium align-middle">Unit Price</th>
                            <th className="border-b border-r border-black p-2 text-right w-[20%] text-[13px] font-medium align-middle">Amount</th>
                            <th className="border-b border-black p-2 w-[5%] print:hidden align-middle" data-html2canvas-ignore="true"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={item.id} className="avoid-break align-middle">
                                <td className="border-b border-r border-black p-2 text-center align-middle border-l-0 text-[13px] font-medium">
                                    {index + 1}
                                </td>
                                <td className="border-b border-r border-black p-2 align-middle">
                                    <EditableCell
                                        isExportingPDF={isExportingPDF}
                                        multiline
                                        placeholder="Item description"
                                        value={item.description}
                                        onChange={(v) => updateItem(item.id, "description", v)}
                                    />
                                </td>
                                <td className="border-b border-r border-black p-2 align-middle">
                                    <EditableCell
                                        isExportingPDF={isExportingPDF}
                                        type="number"
                                        align="center"
                                        value={String(item.quantity || "")}
                                        onChange={(v) => updateItem(item.id, "quantity", Number(v))}
                                    />
                                </td>
                                <td className="border-b border-r border-black p-2 align-middle">
                                    <EditableCell
                                        isExportingPDF={isExportingPDF}
                                        type="number"
                                        align="right"
                                        value={String(item.unitPrice || "")}
                                        onChange={(v) => updateItem(item.id, "unitPrice", Number(v))}
                                    />
                                </td>
                                <td className="border-b border-r border-black p-2 text-right text-[13px] align-middle font-medium">
                                    ₹{(item.quantity * item.unitPrice).toFixed(2)}
                                </td>
                                <td className="border-b border-black p-2 text-center align-middle print:hidden border-r-0" data-html2canvas-ignore="true">
                                    <button onClick={() => removeItem(item.id)} className="inline-flex items-center justify-center">
                                        <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* ADD ITEM BUTTON */}
                <div className="mb-4 mt-2 print:hidden" data-html2canvas-ignore="true">
                    <Button onClick={addItem} variant="outline" className="w-full border-dashed bg-white">
                        <Plus className="w-4 h-4 mr-2" /> Add Item
                    </Button>
                </div>

                {/* FOOTER TOTALS */}
                <table className="avoid-break w-full border border-black text-sm border-collapse mb-8 mt-[-1px]">
                    <tbody>
                        <tr>
                            <td className="border-r border-b border-black p-3 w-[60%] align-top">
                                <p className="text-gray-800 text-[11px] mb-1 font-medium">Estimate Amount in Words</p>
                                <p className="font-semibold text-black leading-normal">{numberToWords(calculateTotal())}</p>
                            </td>
                            <td className="border-b border-black p-0 w-[40%] align-top">
                                <table className="w-full h-full border-collapse">
                                    <tbody>
                                        <tr>
                                            <td className="p-3 text-[11px]">
                                                Amounts
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 pt-0 flex justify-between items-center font-semibold text-black">
                                                <span>Total</span>
                                                <span>₹{calculateTotal().toFixed(2)}</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td className="border-r border-black p-3 align-top h-24">
                                <p className="text-gray-800 text-[11px] mb-1 inline">For payment contact : </p>
                                <span className="text-black font-semibold text-[11px]">+91 93858 20287</span>
                            </td>
                            <td className="p-3 align-top text-center h-24 relative">
                                <p className="text-black text-[10px] font-semibold mt-2">For: ZENITH AUTOMATION</p>
                                <p className="text-[10px] text-gray-800 absolute bottom-3 left-0 right-0">Authorized Signatory</p>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* TERMS AND CONDITIONS */}
                <div className="avoid-break border border-black p-4 text-[11px] mb-4">
                    <p className="font-semibold mb-2 uppercase text-black">Terms &amp; Conditions</p>
                    <div className="flex flex-col gap-1 text-black">
                        {[
                            "This quotation is valid for 15 days from the date issued.",
                            "50% advance payment is required to confirm the order.",
                            "Balance payment must be made upon project completion.",
                            "Installation timeline depends on site readiness and material availability.",
                            "Warranty will be provided as per manufacturer policy.",
                            "Any additional work outside this quotation will be charged separately.",
                        ].map((line, i) => (
                            <div key={i} className="flex gap-2 leading-snug">
                                <span className="flex-shrink-0 font-medium">{i + 1}.</span>
                                <span>{line}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ZenithEstimationPage;
