"use client";

import { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Download, Printer } from "lucide-react";
import ToolHeader from "@/components/Header/Header";

interface WorkItem {
    id: string;
    description: string;
    capacity: string;
    quantity: number;
    unitPrice: number;
}

interface MaterialItem {
    id: string;
    description: string;
    size: string;
    quantity: string;
    make: string;
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
    const rs = parseInt(rsStr, 10);
    const p = parseInt(pStr, 10);
    let res = convertToWords(rs) + " Rupees";
    if (p > 0) res += " and " + convertToWords(p) + " Paise";
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
            <div className={`text-[12px] font-medium text-black leading-snug py-1 w-full ${textAlign} ${className}`}>
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
                className={`border-none p-1 h-auto min-h-[30px] w-full focus-visible:ring-0 shadow-none resize-none overflow-hidden text-[12px] leading-snug bg-transparent text-black font-medium ${textAlign} ${className}`}
            />
        );
    }

    return (
        <Input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`border-none p-1 h-7 w-full focus-visible:ring-0 rounded-none shadow-none text-[12px] leading-snug bg-transparent text-black font-medium ${textAlign} ${className}`}
        />
    );
}

const EstimationPage = () => {
    const printRef = useRef<HTMLDivElement>(null);

    const [quotationNumber, setQuotationNumber] = useState("");
    const [quotationDate, setQuotationDate] = useState("");
    const [customerDetails, setCustomerDetails] = useState("");
    const [systemCapacity, setSystemCapacity] = useState("3.24 KW");
    const [subsidyAmount, setSubsidyAmount] = useState<number>(0);
    const [isExportingPDF, setIsExportingPDF] = useState(false);

    const [workItems, setWorkItems] = useState<WorkItem[]>([
        { id: "1", description: "Residential Rooftop Grid Connected Solar System", capacity: "3.24 KW", quantity: 1, unitPrice: 150000 },
        { id: "2", description: "Mounting structure (Hot dip galvanized)", capacity: "-", quantity: 1, unitPrice: 10000 },
        { id: "3", description: "Discom Net Metering Connectivity Charges", capacity: "-", quantity: 1, unitPrice: 5000 },
    ]);

    const [materialItems, setMaterialItems] = useState<MaterialItem[]>([
        { id: "1", description: "Mono Bifacial Solar Module", size: "540Wp", quantity: "6", make: "WAAREE" },
        { id: "2", description: "Grid Tie Inverter", size: "3.4 KW", quantity: "1", make: "SOLARYAAN" },
        { id: "3", description: "G.I. Pipe Fabricated Structure", size: "Rafter: 60x40x2mm", quantity: "As per Req.", make: "HINDUSTAN" },
        { id: "4", description: "DC Cable", size: "1C x 2.5 SQMM", quantity: "As per Req.", make: "POLYCAB" },
        { id: "5", description: "AC Cable", size: "1C x 2.5 SQMM", quantity: "As per Req.", make: "POLYCAB" },
    ]);

    useEffect(() => {
        setQuotationNumber(`S${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`);
        const d = new Date();
        setQuotationDate(`${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`);
    }, []);

    const addWorkItem = () => setWorkItems([...workItems, { id: Date.now().toString(), description: "", capacity: "", quantity: 1, unitPrice: 0 }]);
    const removeWorkItem = (id: string) => { if (workItems.length > 1) setWorkItems(workItems.filter(i => i.id !== id)); };
    const updateWorkItem = (id: string, field: keyof WorkItem, value: string | number) =>
        setWorkItems(workItems.map(i => i.id === id ? { ...i, [field]: value } : i));

    const addMaterialItem = () => setMaterialItems([...materialItems, { id: Date.now().toString(), description: "", size: "", quantity: "1", make: "" }]);
    const removeMaterialItem = (id: string) => { if (materialItems.length > 1) setMaterialItems(materialItems.filter(i => i.id !== id)); };
    const updateMaterialItem = (id: string, field: keyof MaterialItem, value: string) =>
        setMaterialItems(materialItems.map(i => i.id === id ? { ...i, [field]: value } : i));

    const grandTotal = workItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const finalCosting = Math.max(0, grandTotal - (subsidyAmount || 0));

    const handleDownloadPDF = async () => {
        const element = printRef.current;
        if (!element) return;

        setIsExportingPDF(true);
        // Wait 50ms for React to swap components to static text divs
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

            // How many canvas pixels fit in one A4 content area height
            const canvasPageHeight = Math.floor((canvas.width / contentW) * contentH);

            // Measure DOM elements with .avoid-break to prevent cutting them in half
            const containerRect = element.getBoundingClientRect();
            const scaleRatio = canvas.height / element.offsetHeight;

            const breakableElements = Array.from(element.querySelectorAll(".avoid-break")) as HTMLElement[];
            const blockBounds = breakableElements.map((el) => {
                const rect = el.getBoundingClientRect();
                const top = (rect.top - containerRect.top) * scaleRatio;
                const bottom = (rect.bottom - containerRect.top) * scaleRatio;
                return { top, bottom, height: bottom - top };
            });

            // Calculate smart slice heights
            const slices: { srcY: number; srcH: number }[] = [];
            let currentY = 0;

            while (currentY < canvas.height - 5) {
                let targetY = currentY + canvasPageHeight;

                if (targetY >= canvas.height) {
                    slices.push({ srcY: currentY, srcH: canvas.height - currentY });
                    break;
                }

                // Check if targetY cuts through any .avoid-break element
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

            // Render slices to PDF pages
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

    const handlePrint = () => window.print();

    return (
        <div className="min-h-screen bg-gray-100 p-6 pb-24">
            <ToolHeader title="Lumiwaves Solar Estimation" subtitle="Create solar project quotations" />

            <div className="max-w-7xl mx-auto mb-6 flex justify-end gap-3">
                <Button onClick={handlePrint} variant="outline"><Printer className="w-4 h-4 mr-2" /> Print</Button>
                <Button onClick={handleDownloadPDF}><Download className="w-4 h-4 mr-2" /> Download PDF</Button>
            </div>

            <div ref={printRef} className="max-w-4xl mx-auto bg-white p-8 text-sm text-black shadow-lg" style={{ minHeight: '297mm' }}>

                {/* HEADER TABLE */}
                <table className="avoid-break w-full border border-black text-sm border-collapse">
                    <tbody>
                        <tr>
                            <td className="border-r border-black p-4 w-[60%] align-top">
                                <div className="flex gap-4 items-center">
                                    <div className="w-20 h-16 flex-shrink-0 flex items-center justify-center">
                                        <img src="/Lumiwaves_logo.png" alt="Lumiwaves Automation Logo" className="max-w-full max-h-full object-contain" />
                                    </div>
                                    <div className="text-[12px] leading-snug flex flex-col gap-0.5">
                                        <h2 className="text-sm font-bold uppercase text-black">LUMI WAVES AUTOMATION</h2>
                                        <p className="text-[11px] text-gray-600">Solar &amp; Smart Energy Solutions</p>
                                        <p className="mt-1">No:64 Murugan Koil Street, North Bharathipuram</p>
                                        <p>Shanmugapuram, Pondicherry - 605009</p>
                                        <p>Phone: +91 93858 20287 | Email: lumiwaves1@gmail.com</p>
                                    </div>
                                </div>
                            </td>
                            <td className="w-[40%] p-0 align-top">
                                <table className="w-full h-full border-collapse">
                                    <tbody>
                                        <tr>
                                            <td className="border-b border-black p-2.5 w-1/2 align-top">
                                                <p className="text-gray-600 text-[10px] font-medium mb-1 uppercase tracking-wide">Quotation No</p>
                                                {isExportingPDF ? (
                                                    <p className="font-semibold text-[12px] text-black">{quotationNumber}</p>
                                                ) : (
                                                    <Input value={quotationNumber} onChange={e => setQuotationNumber(e.target.value)} className="border border-gray-300 rounded px-1.5 h-7 text-[12px] font-semibold w-full focus-visible:ring-1" />
                                                )}
                                            </td>
                                            <td className="border-b border-l border-black p-2.5 w-1/2 align-top">
                                                <p className="text-gray-600 text-[10px] font-medium mb-1 uppercase tracking-wide">Quotation Date</p>
                                                {isExportingPDF ? (
                                                    <p className="font-semibold text-[12px] text-black">{quotationDate}</p>
                                                ) : (
                                                    <Input value={quotationDate} onChange={e => setQuotationDate(e.target.value)} className="border border-gray-300 rounded px-1.5 h-7 text-[12px] font-semibold w-full focus-visible:ring-1" />
                                                )}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={2} className="p-2.5 align-top">
                                                <p className="text-gray-600 text-[10px] font-medium mb-1 uppercase tracking-wide">System Capacity</p>
                                                {isExportingPDF ? (
                                                    <p className="font-semibold text-[12px] text-black">{systemCapacity}</p>
                                                ) : (
                                                    <Input value={systemCapacity} onChange={e => setSystemCapacity(e.target.value)} className="border border-gray-300 rounded px-1.5 h-7 text-[12px] font-semibold w-full focus-visible:ring-1" />
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* CUSTOMER DETAILS */}
                <table className="avoid-break w-full border-x border-b border-black text-sm mb-4 border-collapse">
                    <tbody>
                        <tr>
                            <td className="p-3 align-top">
                                <p className="text-gray-700 text-[11px] font-medium mb-1">Estimate For / Customer Details</p>
                                {isExportingPDF ? (
                                    <div className="text-[12px] font-medium text-black leading-snug whitespace-pre-wrap">{customerDetails || " "}</div>
                                ) : (
                                    <Textarea
                                        placeholder="Enter Customer Name, Address, Contact details..."
                                        value={customerDetails}
                                        onChange={e => setCustomerDetails(e.target.value)}
                                        onInput={e => { e.currentTarget.style.height = "auto"; e.currentTarget.style.height = e.currentTarget.scrollHeight + "px"; }}
                                        className="border border-gray-300 rounded p-1.5 min-h-[45px] font-medium focus-visible:ring-1 resize-none text-[12px] w-full bg-white text-black"
                                    />
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* SECTION 1 HEADER */}
                <div className="avoid-break bg-[#4682B4] text-white font-bold text-center py-2 border border-black uppercase text-xs tracking-wider mb-[-1px]">
                    SECTION 1: WORK &amp; SOLAR SYSTEM COSTING
                </div>

                {/* SECTION 1 TABLE */}
                <table className="avoid-break w-full border border-black text-sm border-collapse">
                    <thead className="bg-[#f0f4f8]">
                        <tr>
                            <th className="border-b border-r border-black p-2 text-center w-[6%] text-[12px] font-semibold">Sr. No</th>
                            <th className="border-b border-r border-black p-2 text-left w-[40%] text-[12px] font-semibold">Description</th>
                            <th className="border-b border-r border-black p-2 text-center w-[16%] text-[12px] font-semibold">Capacity / Unit</th>
                            <th className="border-b border-r border-black p-2 text-center w-[8%] text-[12px] font-semibold">Qty</th>
                            <th className="border-b border-r border-black p-2 text-right w-[12%] text-[12px] font-semibold">Rate (₹)</th>
                            <th className="border-b border-r border-black p-2 text-right w-[14%] text-[12px] font-semibold">Amount (₹)</th>
                            <th className="border-b border-black p-2 w-[4%] print:hidden" data-html2canvas-ignore="true"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {workItems.map((item, index) => (
                            <tr key={item.id} className="avoid-break align-top">
                                <td className="border-b border-r border-black p-2 text-center text-[12px] font-medium">{index + 1}</td>
                                <td className="border-b border-r border-black p-2">
                                    <EditableCell isExportingPDF={isExportingPDF} value={item.description} onChange={v => updateWorkItem(item.id, "description", v)} multiline placeholder="Work / Scope description" />
                                </td>
                                <td className="border-b border-r border-black p-2">
                                    <EditableCell isExportingPDF={isExportingPDF} value={item.capacity} onChange={v => updateWorkItem(item.id, "capacity", v)} placeholder="e.g. 3.24 KW" align="center" />
                                </td>
                                <td className="border-b border-r border-black p-2">
                                    <EditableCell isExportingPDF={isExportingPDF} value={String(item.quantity || "")} onChange={v => updateWorkItem(item.id, "quantity", Number(v))} type="number" align="center" />
                                </td>
                                <td className="border-b border-r border-black p-2">
                                    <EditableCell isExportingPDF={isExportingPDF} value={String(item.unitPrice || "")} onChange={v => updateWorkItem(item.id, "unitPrice", Number(v))} type="number" align="right" />
                                </td>
                                <td className="border-b border-r border-black p-2 text-right text-[12px] font-semibold align-top">
                                    ₹{(item.quantity * item.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="border-b border-black p-1 text-center print:hidden" data-html2canvas-ignore="true">
                                    <button onClick={() => removeWorkItem(item.id)}><Trash2 className="w-3.5 h-3.5 text-red-500 hover:text-red-700" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mb-2 mt-1 print:hidden" data-html2canvas-ignore="true">
                    <Button onClick={addWorkItem} variant="outline" size="sm" className="w-full border-dashed bg-white text-xs">
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Work / Project Item
                    </Button>
                </div>

                {/* TOTALS */}
                <table className="avoid-break w-full border border-black text-sm border-collapse mb-6">
                    <tbody>
                        <tr className="bg-[#fcfcfc]">
                            <td colSpan={2} className="border-r border-b border-black p-2 font-bold text-right text-[12px]">Grand Total (System Installation Cost)</td>
                            <td className="border-b border-black p-2 text-right font-bold text-xs w-[25%]">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                            <td colSpan={2} className="border-r border-b border-black p-2 text-right text-[12px] font-medium text-gray-700">Less: Subsidy / Govt Discount (Optional)</td>
                            <td className="border-b border-black p-2 text-right text-xs">
                                {isExportingPDF ? (
                                    <div className="text-[12px] font-medium text-right text-black">{subsidyAmount > 0 ? `₹${subsidyAmount.toLocaleString('en-IN')}` : "-"}</div>
                                ) : (
                                    <Input type="number" placeholder="0" value={subsidyAmount || ""} onChange={e => setSubsidyAmount(Number(e.target.value))} className="border border-gray-300 rounded text-right px-1.5 h-6 text-xs w-full bg-white" />
                                )}
                            </td>
                        </tr>
                        <tr className="bg-gray-100">
                            <td colSpan={2} className="border-r border-b border-black p-2 font-bold text-right text-[12px]">Customer Costing After Subsidy / Net Payable</td>
                            <td className="border-b border-black p-2 text-right font-bold text-xs">₹{finalCosting.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                            <td colSpan={3} className="p-3 bg-[#f9fafb]">
                                <span className="text-[11px] text-gray-700 font-medium">Total Amount in Words: </span>
                                <span className="font-bold text-xs text-black">{numberToWords(finalCosting)}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div className="my-4 border-t-2 border-black"></div>

                {/* SECTION 2 HEADER */}
                <div className="avoid-break bg-[#4682B4] text-white font-bold text-center py-2 border border-black uppercase text-xs tracking-wider mb-[-1px]">
                    ITEM DESCRIPTION &amp; MATERIAL SPECIFICATIONS FOR ROOFTOP SOLAR POWER PLANT
                </div>

                {/* SECTION 2 TABLE */}
                <table className="avoid-break w-full border border-black text-sm border-collapse mb-2">
                    <thead className="bg-[#f0f4f8]">
                        <tr>
                            <th className="border-b border-r border-black p-2 text-center w-[6%] text-[12px] font-semibold">Sr. No</th>
                            <th className="border-b border-r border-black p-2 text-left w-[40%] text-[12px] font-semibold">Description</th>
                            <th className="border-b border-r border-black p-2 text-left w-[26%] text-[12px] font-semibold">Size / Specification</th>
                            <th className="border-b border-r border-black p-2 text-center w-[12%] text-[12px] font-semibold">Qty</th>
                            <th className="border-b border-r border-black p-2 text-left w-[12%] text-[12px] font-semibold">Make / Brand</th>
                            <th className="border-b border-black p-2 w-[4%] print:hidden" data-html2canvas-ignore="true"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {materialItems.map((item, index) => (
                            <tr key={item.id} className="avoid-break align-top">
                                <td className="border-b border-r border-black p-2 text-center text-[12px] font-medium">{index + 1}</td>
                                <td className="border-b border-r border-black p-2">
                                    <EditableCell isExportingPDF={isExportingPDF} value={item.description} onChange={v => updateMaterialItem(item.id, "description", v)} multiline placeholder="Product / Item description" />
                                </td>
                                <td className="border-b border-r border-black p-2">
                                    <EditableCell isExportingPDF={isExportingPDF} value={item.size} onChange={v => updateMaterialItem(item.id, "size", v)} placeholder="Size / Specs" />
                                </td>
                                <td className="border-b border-r border-black p-2">
                                    <EditableCell isExportingPDF={isExportingPDF} value={item.quantity} onChange={v => updateMaterialItem(item.id, "quantity", v)} placeholder="Qty" align="center" />
                                </td>
                                <td className="border-b border-r border-black p-2">
                                    <EditableCell isExportingPDF={isExportingPDF} value={item.make} onChange={v => updateMaterialItem(item.id, "make", v)} placeholder="Make / Brand" />
                                </td>
                                <td className="border-b border-black p-1 text-center print:hidden" data-html2canvas-ignore="true">
                                    <button onClick={() => removeMaterialItem(item.id)}><Trash2 className="w-3.5 h-3.5 text-red-500 hover:text-red-700" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mb-6 print:hidden" data-html2canvas-ignore="true">
                    <Button onClick={addMaterialItem} variant="outline" size="sm" className="w-full border-dashed bg-white text-xs">
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Material / Product Specification
                    </Button>
                </div>

                {/* SIGNATURE */}
                <table className="avoid-break w-full border border-black text-sm border-collapse mb-4 mt-4">
                    <tbody>
                        <tr>
                            <td className="border-r border-black p-3 align-top w-[60%] h-24">
                                <p className="text-gray-800 text-[11px] mb-1 font-medium">Payment Contact &amp; Enquiries:</p>
                                <span className="text-black font-semibold text-[12px]">+91 93858 20287 | lumiwaves1@gmail.com</span>
                            </td>
                            <td className="p-3 align-top text-center w-[40%] h-24 relative">
                                <p className="text-black text-[11px] font-bold mt-1">For: LUMI WAVES AUTOMATION</p>
                                <p className="text-[10px] text-gray-800 absolute bottom-3 left-0 right-0">Authorized Signatory</p>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* TERMS */}
                <div className="avoid-break border border-black p-3 text-[11px]">
                    <p className="font-bold mb-1.5 uppercase text-black">Terms &amp; Conditions</p>
                    <div className="flex flex-col gap-1 text-black">
                        {[
                            "This estimation is valid for 15 days from the date issued.",
                            "50% advance payment is required to confirm the order.",
                            "Balance payment must be made upon completion of installation.",
                            "Net metering and discom permissions are subject to electricity board norms.",
                            "Warranty will be provided as per standard manufacturer policies.",
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

export default EstimationPage;