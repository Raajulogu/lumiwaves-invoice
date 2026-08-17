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
    hsn: string;
    rate: number;
    qty: number;
    unit: string;
    cgst: number;
    sgst: number;
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
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (multiline && textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [value, multiline, isExportingPDF]);

    if (isExportingPDF) {
        return (
            <div className={`text-[11px] font-medium text-black leading-snug py-0.5 w-full whitespace-pre-wrap ${textAlign} ${className}`}>
                {value || "\u00A0"}
            </div>
        );
    }

    if (multiline) {
        return (
            <Textarea
                ref={textareaRef}
                placeholder={placeholder}
                value={value}
                rows={1}
                onChange={(e) => onChange(e.target.value)}
                className={`border-none p-1 h-auto min-h-[24px] w-full focus-visible:ring-0 shadow-none resize-none overflow-hidden text-[11px] leading-snug bg-transparent text-black font-medium ${textAlign} ${className}`}
            />
        );
    }

    return (
        <Input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`border-none p-1 h-6 w-full focus-visible:ring-0 rounded-none shadow-none text-[11px] leading-snug bg-transparent text-black font-medium ${textAlign} ${className}`}
        />
    );
}

const EstimationPage = () => {
    const printRef = useRef<HTMLDivElement>(null);

    const [quotationNumber, setQuotationNumber] = useState("");
    const [quotationDate, setQuotationDate] = useState("");
    const [customerDetails, setCustomerDetails] = useState("GUNA\nLUMIWAVES\nPh: 9385820287");
    const [placeOfSupply, setPlaceOfSupply] = useState("33-TAMIL NADU");
    const [validity, setValidity] = useState("");
    const [dispatchFrom, setDispatchFrom] = useState("No:64 Murugan Koil Street, North Bharathipuram,\nShanmugapuram, Pondicherry - 605009");
    const [reference, setReference] = useState("");
    
    const [bankName, setBankName] = useState("Indian Bank");
    const [accountNo, setAccountNo] = useState("1234567890");
    const [ifsc, setIfsc] = useState("IDIB000S123");
    const [branch, setBranch] = useState("PONDICHERRY");

    const [isExportingPDF, setIsExportingPDF] = useState(false);

    const [workItems, setWorkItems] = useState<WorkItem[]>([
        { id: "1", description: "3.2 KW ON GRID SOLAR SYSTEM INSTALLATION WORK", hsn: "998731", rate: 58000, qty: 3.2, unit: "UNT", cgst: 9, sgst: 9 },
    ]);

    const [notes, setNotes] = useState([
        "1. WAAREE 550W TOPCON BIFACIAL DCR PANELS (30 Y WARRANTY).",
        "2. GROWATT INVERTER 3.3 KW SINGLE PHASE (10Y WARRANTY).",
        "3. GI HOT DIP STRUCTURE 72X60X40X2MM THICKNESS( 5 Y WARRANTY).",
        "4. POLYCAB 6SQ MM CABLES (EARTH, LA, DC, AC).",
        "5. LA 1 METER 1NOS.",
        "6. EARTH ROD 1 METER 3NOS.",
        "7. HPL SINGLE PHASE ENERGY METER.",
        "8. 1\" PVC PIPE 2MM, SS CLAMP, SS SCREW.",
        "9. ACDB,DCDB (L&T,SCHNEIDER,ABB,LEGRAND,HAVELLS).",
        "10. NET METERING WORK ALSO.",
        "11. 3 FREE MAINTANCE."
    ].join("\n"));

    const [terms, setTerms] = useState([
        "1. All quotations are valid for 30 days from the date of issue unless otherwise specified.",
        "2. Prices are exclusive of taxes and additional charges unless stated.",
        "3. Payment terms will be as specified in the final invoice.",
        "4. Delivery timelines provided are estimates and subject to change.",
        "5. Quotations do not constitute a binding contract until accepted and confirmed in writing.",
        "6. Any changes to the scope of work may result in revised pricing.",
        "7. Confidentiality of the quotation content must be maintained by the recipient."
    ].join("\n"));

    useEffect(() => {
        setQuotationNumber(`EST-${Math.floor(Math.random() * 1000).toString()}`);
        const d = new Date();
        const dateStr = `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
        setQuotationDate(dateStr);
        setValidity(dateStr);
    }, []);

    const addWorkItem = () => setWorkItems([...workItems, { id: Date.now().toString(), description: "", hsn: "", rate: 0, qty: 1, unit: "UNT", cgst: 9, sgst: 9 }]);
    const removeWorkItem = (id: string) => { setWorkItems(workItems.filter(i => i.id !== id)); };
    const updateWorkItem = (id: string, field: keyof WorkItem, value: string | number) =>
        setWorkItems(workItems.map(i => i.id === id ? { ...i, [field]: value } : i));

    let totalTaxable = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalQty = 0;

    const hsnTotals = workItems.reduce((acc, item) => {
        const taxable = item.rate * item.qty;
        const cgstAmt = taxable * item.cgst / 100;
        const sgstAmt = taxable * item.sgst / 100;
        
        totalTaxable += taxable;
        totalCgst += cgstAmt;
        totalSgst += sgstAmt;
        totalQty += item.qty;

        if (!item.hsn) return acc;
        
        if (!acc[item.hsn]) {
            acc[item.hsn] = { taxable: 0, cgstAmount: 0, sgstAmount: 0, cgstRate: item.cgst, sgstRate: item.sgst };
        }
        acc[item.hsn].taxable += taxable;
        acc[item.hsn].cgstAmount += cgstAmt;
        acc[item.hsn].sgstAmount += sgstAmt;
        
        return acc;
    }, {} as Record<string, { taxable: number, cgstAmount: number, sgstAmount: number, cgstRate: number, sgstRate: number }>);

    const grandTotal = totalTaxable + totalCgst + totalSgst;

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

            const margin = 10;
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

            while (currentY < canvas.height - 15) {
                let targetY = currentY + canvasPageHeight;

                if (targetY >= canvas.height) {
                    const remainingHeight = canvas.height - currentY;
                    if (remainingHeight > 15) {
                        slices.push({ srcY: currentY, srcH: remainingHeight });
                    }
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
                if (srcH <= 0) break;
                
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

    const handlePrint = () => window.print();

    return (
        <div className="min-h-screen bg-gray-100 p-6 pb-24">
            <ToolHeader title="Lumiwaves Solar Estimation" subtitle="Create solar project quotations" />

            <div className="max-w-7xl mx-auto mb-6 flex justify-end gap-3">
                <Button onClick={handlePrint} variant="outline"><Printer className="w-4 h-4 mr-2" /> Print</Button>
                <Button onClick={handleDownloadPDF}><Download className="w-4 h-4 mr-2" /> Download PDF</Button>
            </div>

            <div ref={printRef} className="max-w-4xl mx-auto bg-white p-6 text-sm text-black shadow-lg flex flex-col" style={{ minHeight: '297mm' }}>

                {/* HEADER */}
                <div className="flex justify-between items-start mb-6 avoid-break">
                    <div className="flex gap-4 items-center">
                        <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
                            <img src="/Lumiwaves_logo.png" alt="Lumiwaves Logo" className="max-w-full max-h-full object-contain" />
                        </div>
                        <div className="text-[11px] leading-snug flex flex-col">
                            <h2 className="text-[16px] font-bold uppercase text-black mb-1">LUMI WAVES AUTOMATION</h2>
                            <p className="font-semibold text-gray-700">Solar &amp; Smart Energy Solutions</p>
                            <p>No:64 Murugan Koil Street, North Bharathipuram,</p>
                            <p>Shanmugapuram, Pondicherry - 605009</p>
                            <p>Mobile: +91 93858 20287 | Email: lumiwaves1@gmail.com</p>
                            <p>Website: WWW.LUMIWAVES.COM</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h1 className="text-xl font-bold text-blue-600 uppercase tracking-widest mb-1">QUOTATION</h1>
                        <p className="text-[10px] text-gray-800 font-bold uppercase">ORIGINAL FOR RECIPIENT</p>
                    </div>
                </div>

                {/* INFO DETAILS BOX */}
                <div className="border border-black flex w-full text-[11px] leading-tight avoid-break">
                    {/* Customer Details Box */}
                    <div className="w-1/2 border-r border-black p-2 flex flex-col">
                        <span className="font-semibold mb-1">Customer Details:</span>
                        <EditableCell isExportingPDF={isExportingPDF} value={customerDetails} onChange={setCustomerDetails} multiline placeholder="Enter Customer Details..." />
                    </div>
                    {/* Quotation Details */}
                    <div className="w-1/2 flex flex-col">
                        <div className="flex border-b border-black">
                            <div className="w-1/2 border-r border-black p-2">
                                <span className="font-semibold">Quotation #:</span>
                                <EditableCell isExportingPDF={isExportingPDF} value={quotationNumber} onChange={setQuotationNumber} className="mt-1 font-medium" />
                            </div>
                            <div className="w-1/2 p-2">
                                <span className="font-semibold">Date:</span>
                                <EditableCell isExportingPDF={isExportingPDF} value={quotationDate} onChange={setQuotationDate} className="mt-1 font-medium" />
                            </div>
                        </div>
                        <div className="flex border-b border-black">
                            <div className="w-1/2 border-r border-black p-2">
                                <span className="font-semibold">Place of Supply:</span>
                                <EditableCell isExportingPDF={isExportingPDF} value={placeOfSupply} onChange={setPlaceOfSupply} className="mt-1 font-medium" />
                            </div>
                            <div className="w-1/2 p-2">
                                <span className="font-semibold">Validity:</span>
                                <EditableCell isExportingPDF={isExportingPDF} value={validity} onChange={setValidity} className="mt-1 font-medium" />
                            </div>
                        </div>
                        <div className="p-2 border-b border-black flex flex-col">
                            <span className="font-semibold mb-1">Dispatch From:</span>
                            <EditableCell isExportingPDF={isExportingPDF} value={dispatchFrom} onChange={setDispatchFrom} multiline className="font-medium" />
                        </div>
                        <div className="p-2 flex flex-col">
                            <span className="font-semibold mb-1">Reference:</span>
                            <EditableCell isExportingPDF={isExportingPDF} value={reference} onChange={setReference} className="font-medium" />
                        </div>
                    </div>
                </div>

                {/* MAIN ITEMS TABLE */}
                <table className="w-full border-x border-black text-[10px] border-collapse avoid-break" style={{borderBottom: workItems.length === 0 ? "1px solid black" : "none"}}>
                    <thead>
                        <tr className="border-b border-black">
                            <th className="border-r border-black p-1.5 text-center font-bold w-[4%]">#</th>
                            <th className="border-r border-black p-1.5 text-left font-bold w-[26%]">Item</th>
                            <th className="border-r border-black p-1.5 text-center font-bold w-[9%]">HSN/SAC</th>
                            <th className="border-r border-black p-1.5 text-right font-bold w-[10%]">Rate / Item</th>
                            <th className="border-r border-black p-1.5 text-center font-bold w-[9%]">Qty</th>
                            <th className="border-r border-black p-1.5 text-right font-bold w-[11%]">Taxable Value</th>
                            <th className="border-r border-black p-1.5 text-right font-bold w-[10%]">CGST</th>
                            <th className="border-r border-black p-1.5 text-right font-bold w-[10%]">SGST</th>
                            <th className="p-1.5 text-right font-bold w-[11%]">Amount</th>
                            <th className="p-1.5 w-[3%] border-l border-black print:hidden" data-html2canvas-ignore="true"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {workItems.map((item, index) => {
                            const taxableValue = item.rate * item.qty;
                            const cgstAmount = taxableValue * item.cgst / 100;
                            const sgstAmount = taxableValue * item.sgst / 100;
                            const amount = taxableValue + cgstAmount + sgstAmount;
                            return (
                                <tr key={item.id} className="align-top border-b border-gray-200">
                                    <td className="border-r border-black p-1.5 text-center">{index + 1}</td>
                                    <td className="border-r border-black p-1.5">
                                        <EditableCell isExportingPDF={isExportingPDF} value={item.description} onChange={v => updateWorkItem(item.id, "description", v)} multiline />
                                    </td>
                                    <td className="border-r border-black p-1.5 text-center">
                                        <EditableCell isExportingPDF={isExportingPDF} value={item.hsn} onChange={v => updateWorkItem(item.id, "hsn", v)} align="center" />
                                    </td>
                                    <td className="border-r border-black p-1.5 text-right">
                                        <EditableCell isExportingPDF={isExportingPDF} value={String(item.rate)} onChange={v => updateWorkItem(item.id, "rate", Number(v))} type="number" align="right" />
                                    </td>
                                    <td className="border-r border-black p-1.5 text-center flex flex-col items-center justify-center gap-0.5">
                                        <div className="flex w-full items-center justify-center">
                                            <EditableCell isExportingPDF={isExportingPDF} value={String(item.qty)} onChange={v => updateWorkItem(item.id, "qty", Number(v))} type="text" align="center" className="w-10" />
                                            <EditableCell isExportingPDF={isExportingPDF} value={item.unit} onChange={v => updateWorkItem(item.id, "unit", v)} align="center" className="w-10" />
                                        </div>
                                    </td>
                                    <td className="border-r border-black p-1.5 text-right font-medium">{taxableValue.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                                    <td className="border-r border-black p-1.5 text-right font-medium">
                                        {cgstAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                                        <div className="text-[9px] text-gray-500 font-normal mt-0.5">
                                            (<EditableCell isExportingPDF={isExportingPDF} value={String(item.cgst)} onChange={v => updateWorkItem(item.id, "cgst", Number(v))} type="text" align="center" className="inline w-6 p-0 h-4"/>%)
                                        </div>
                                    </td>
                                    <td className="border-r border-black p-1.5 text-right font-medium">
                                        {sgstAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                                        <div className="text-[9px] text-gray-500 font-normal mt-0.5">
                                            (<EditableCell isExportingPDF={isExportingPDF} value={String(item.sgst)} onChange={v => updateWorkItem(item.id, "sgst", Number(v))} type="text" align="center" className="inline w-6 p-0 h-4"/>%)
                                        </div>
                                    </td>
                                    <td className="p-1.5 text-right font-semibold">{amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                                    <td className="p-1.5 text-center border-l border-black print:hidden" data-html2canvas-ignore="true">
                                        <button onClick={() => removeWorkItem(item.id)}><Trash2 className="w-3.5 h-3.5 text-red-500 hover:text-red-700" /></button>
                                    </td>
                                </tr>
                            );
                        })}
                        {/* Empty filler space */}
                        <tr>
                            <td className="border-r border-black p-1 h-24"></td>
                            <td className="border-r border-black p-1 h-24"></td>
                            <td className="border-r border-black p-1 h-24"></td>
                            <td className="border-r border-black p-1 h-24"></td>
                            <td className="border-r border-black p-1 h-24"></td>
                            <td className="border-r border-black p-1 h-24"></td>
                            <td className="border-r border-black p-1 h-24"></td>
                            <td className="border-r border-black p-1 h-24"></td>
                            <td className="p-1 h-24"></td>
                            <td className="border-l border-black print:hidden" data-html2canvas-ignore="true"></td>
                        </tr>
                    </tbody>
                </table>

                <div className="print:hidden border-x border-black bg-gray-50 py-1 px-2" data-html2canvas-ignore="true">
                    <Button onClick={addWorkItem} variant="outline" size="sm" className="w-full border-dashed bg-white text-xs h-7">
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Item
                    </Button>
                </div>

                {/* TOTALS AREA */}
                <div className="flex border border-black text-[11px] avoid-break">
                    <div className="w-[65%] border-r border-black p-2 flex flex-col justify-between">
                        <div>
                            <div className="mb-1">
                                Total Items / Qty : {workItems.length} / {totalQty}
                            </div>
                            <div className="mb-2">
                                Total amount (in words): <span className="font-semibold text-black">INR {numberToWords(grandTotal)} Only.</span>
                            </div>
                        </div>
                        <div>
                            <div className="font-bold mb-1 underline">Bank Details:</div>
                            <table className="w-full text-[10px] max-w-sm">
                                <tbody>
                                    <tr><td className="w-20 font-medium pb-1">Bank:</td><td className="font-semibold"><EditableCell isExportingPDF={isExportingPDF} value={bankName} onChange={setBankName} /></td></tr>
                                    <tr><td className="font-medium pb-1">Account #:</td><td className="font-semibold"><EditableCell isExportingPDF={isExportingPDF} value={accountNo} onChange={setAccountNo} /></td></tr>
                                    <tr><td className="font-medium pb-1">IFSC Code:</td><td className="font-semibold"><EditableCell isExportingPDF={isExportingPDF} value={ifsc} onChange={setIfsc} /></td></tr>
                                    <tr><td className="font-medium pb-1">Branch:</td><td className="font-semibold"><EditableCell isExportingPDF={isExportingPDF} value={branch} onChange={setBranch} /></td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="w-[35%] flex flex-col font-medium">
                        <div className="flex justify-between p-2 border-b border-black">
                            <span>Taxable Amount</span>
                            <span className="font-bold text-[12px]">₹{totalTaxable.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                        </div>
                        <div className="flex justify-between p-2 border-b border-black">
                            <span>CGST Amount</span>
                            <span className="font-bold text-[12px]">₹{totalCgst.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                        </div>
                        <div className="flex justify-between p-2 border-b border-black">
                            <span>SGST Amount</span>
                            <span className="font-bold text-[12px]">₹{totalSgst.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                        </div>
                        <div className="flex justify-between p-2 font-bold text-[14px] items-center h-full">
                            <span>Total</span>
                            <span>₹{grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                        </div>
                    </div>
                </div>

                {/* TAX TABLE AREA */}
                <table className="w-full border-x border-b border-black text-[10px] border-collapse text-center avoid-break">
                    <thead className="bg-gray-50">
                        <tr className="border-b border-black">
                            <th className="border-r border-black p-1 font-semibold w-[15%]" rowSpan={2}>HSN/SAC</th>
                            <th className="border-r border-black p-1 font-semibold w-[17%]" rowSpan={2}>Taxable Value</th>
                            <th className="border-r border-black p-1 font-semibold border-b w-[24%]" colSpan={2}>Central Tax</th>
                            <th className="border-r border-black p-1 font-semibold border-b w-[24%]" colSpan={2}>State/UT Tax</th>
                            <th className="p-1 font-semibold w-[20%]" rowSpan={2}>Total Tax</th>
                        </tr>
                        <tr className="border-b border-black">
                            <th className="border-r border-black p-1 font-semibold w-[10%]">Rate</th>
                            <th className="border-r border-black p-1 font-semibold w-[14%]">Amount</th>
                            <th className="border-r border-black p-1 font-semibold w-[10%]">Rate</th>
                            <th className="border-r border-black p-1 font-semibold w-[14%]">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(hsnTotals).map(([hsn, data]) => (
                            <tr key={hsn} className="border-b border-gray-300">
                                <td className="border-r border-black p-1.5 text-left">{hsn}</td>
                                <td className="border-r border-black p-1.5 text-right">{data.taxable.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                                <td className="border-r border-black p-1.5">{data.cgstRate}%</td>
                                <td className="border-r border-black p-1.5 text-right">{data.cgstAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                                <td className="border-r border-black p-1.5">{data.sgstRate}%</td>
                                <td className="border-r border-black p-1.5 text-right">{data.sgstAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                                <td className="p-1.5 text-right">{(data.cgstAmount + data.sgstAmount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                            </tr>
                        ))}
                        {Object.keys(hsnTotals).length === 0 && (
                             <tr className="border-b border-gray-300">
                                <td className="border-r border-black p-1.5 text-left">-</td>
                                <td className="border-r border-black p-1.5 text-right">0.00</td>
                                <td className="border-r border-black p-1.5">0%</td>
                                <td className="border-r border-black p-1.5 text-right">0.00</td>
                                <td className="border-r border-black p-1.5">0%</td>
                                <td className="border-r border-black p-1.5 text-right">0.00</td>
                                <td className="p-1.5 text-right">0.00</td>
                            </tr>
                        )}
                        <tr className="border-t border-black font-bold bg-gray-50">
                            <td className="border-r border-black p-1.5 text-right">TOTAL</td>
                            <td className="border-r border-black p-1.5 text-right">{totalTaxable.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                            <td className="border-r border-black p-1.5"></td>
                            <td className="border-r border-black p-1.5 text-right">{totalCgst.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                            <td className="border-r border-black p-1.5"></td>
                            <td className="border-r border-black p-1.5 text-right">{totalSgst.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                            <td className="p-1.5 text-right">{(totalCgst + totalSgst).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                    </tbody>
                </table>

                {/* BOTTOM AREA */}
                <div className="flex border-x border-b border-black text-[10px] avoid-break flex-1">
                    <div className="w-[70%] border-r border-black p-3 flex flex-col gap-4">
                        <div>
                            <div className="font-bold underline mb-1.5 text-black">Notes:</div>
                            <EditableCell isExportingPDF={isExportingPDF} value={notes} onChange={setNotes} multiline />
                        </div>
                        <div>
                            <div className="font-bold mb-1.5 text-black">Terms and Conditions:</div>
                            <EditableCell isExportingPDF={isExportingPDF} value={terms} onChange={setTerms} multiline />
                        </div>
                    </div>
                    <div className="w-[30%] p-3 flex flex-col justify-between items-end text-right">
                        <div className="font-semibold text-[11px]">For LUMI WAVES AUTOMATION</div>
                        {/* Placeholder for Signature Image if needed */}
                        <div className="mt-20 text-[11px] text-gray-700">Authorized Signatory</div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="mt-3 text-[10px] font-semibold text-gray-800 flex gap-1.5 justify-center">
                    <span>Page 1/1</span>
                    <span>•</span>
                    <span>This is a digitally signed document.</span>
                </div>

            </div>
        </div>
    );
};

export default EstimationPage;