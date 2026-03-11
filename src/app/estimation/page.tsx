"use client";

import { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Download, Printer } from "lucide-react";
import ToolHeader from "@/components/Header/Header";

interface EstimateItem {
    id: string
    description: string
    quantity: number
    unitPrice: number
};

const EstimationPage = () => {
    const printRef = useRef<HTMLDivElement>(null);

    const [quotationNumber, setQuotationNumber] = useState("");
    const [validTill, setValidTill] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");
    const [placeOfSupply, setPlaceOfSupply] = useState("");
    const [gstNumber, setGstNumber] = useState("");

    const [items, setItems] = useState<EstimateItem[]>([
        { id: "1", description: "", quantity: 1, unitPrice: 0 },
    ]);

    useEffect(() => {
        const generateNumber = () => {
            const date = new Date();
            return `EST-${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}-${Math.floor(
                Math.random() * 100
            )}`;
        };
        setQuotationNumber(generateNumber());
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
        };
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

        const canvas = await html2canvas(element, {
            scale: 3,
            useCORS: true,
        });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        pdf.save(`${quotationNumber}.pdf`);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <ToolHeader title="Estimation / Quotation" subtitle="Create project quotations" />

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
                className="max-w-4xl mx-auto bg-white p-10 text-sm text-black border-2 border-black"
            >

                {/* COMPANY HEADER */}
                <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold uppercase tracking-tight">Lumiwaves Automation</h1>
                        <p className="text-gray-600 mt-1 font-medium">Smart Living, Simplified</p>
                    </div>
                    <div className="text-right text-sm">
                        <p>No:64 Murugan Koil Street, North Bharathipuram</p>
                        <p>Shanmugapuram, Pondicherry - 605009</p>
                        <p className="mt-1 font-semibold">Phone: +91 93858 20287 | Email: lumiwaves1@gmail.com</p>
                    </div>
                </div>

                {/* QUOTATION TITLE */}
                <div className="text-center font-bold text-lg border-b-2 border-black py-2 mb-4">
                    QUOTATION
                </div>

                {/* CUSTOMER + QUOTATION DETAILS */}
                <div className="border-2 border-black mb-6">
                    <div className="grid grid-cols-2">

                        <div className="p-4 border-r-2 border-black">
                            <p className="font-semibold mb-2">Customer Details</p>

                            <Label>Customer Name</Label>
                            <Input
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                            />

                            <Label className="mt-3">Customer Address</Label>
                            <Textarea
                                value={customerAddress}
                                onChange={(e) => setCustomerAddress(e.target.value)}
                            />
                        </div>

                        <div className="p-4">
                            <p className="font-semibold mb-2">Supply Details</p>

                            <Label>Place of Supply</Label>
                            <Input
                                value={placeOfSupply}
                                onChange={(e) => setPlaceOfSupply(e.target.value)}
                            />

                            <Label className="mt-3">GST Number</Label>
                            <Input
                                value={gstNumber}
                                onChange={(e) => setGstNumber(e.target.value)}
                            />
                        </div>

                    </div>
                </div>

                {/* ITEMS TABLE */}
                <table className="w-full border-2 border-black text-sm mb-6">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border border-black p-2 text-left">Description</th>
                            <th className="border border-black p-2 text-center">Qty</th>
                            <th className="border border-black p-2 text-right">Unit Price</th>
                            <th className="border border-black p-2 text-right">Amount</th>
                            <th className="border border-black p-2"></th>
                        </tr>
                    </thead>

                    <tbody>
                        {items.map((item, index) => (
                            <tr key={item.id} className="border-t border-black">

                                <td className="border border-black text-center p-2">
                                    {index + 1}
                                </td>

                                <td className="border border-black p-2">
                                    <Input
                                        className="border-none focus-visible:ring-0"
                                        value={item.description}
                                        onChange={(e) =>
                                            updateItem(item.id, "description", e.target.value)
                                        }
                                    />
                                </td>

                                <td className="border border-black p-2">
                                    <Input
                                        type="number"
                                        className="border-none text-center focus-visible:ring-0"
                                        value={item.quantity}
                                        onChange={(e) =>
                                            updateItem(item.id, "quantity", Number(e.target.value))
                                        }
                                    />
                                </td>

                                <td className="border border-black p-2">
                                    <Input
                                        type="number"
                                        className="border-none text-right focus-visible:ring-0"
                                        value={item.unitPrice}
                                        onChange={(e) =>
                                            updateItem(item.id, "unitPrice", Number(e.target.value))
                                        }
                                    />
                                </td>

                                <td className="border border-black text-right p-2">
                                    ₹{(item.quantity * item.unitPrice).toFixed(2)}
                                </td>
                                <td className="border p-2 text-center">
                                    <button onClick={() => removeItem(item.id)}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* ADD ITEM BUTTON */}
                <div className="mb-4">
                    <Button onClick={addItem}>
                        <Plus className="w-4 h-4 mr-2" /> Add Item
                    </Button>
                </div>

                {/* TOTAL SECTION */}
                <div className="flex justify-end mb-8">
                    <div className="w-72 border-2 border-black p-4">
                        <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span>₹{calculateTotal().toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* TERMS */}
                <div className="border-2 border-black p-4 text-xs leading-5">
                    <h3 className="font-semibold mb-2">Terms & Conditions</h3>

                    <ol className="list-decimal pl-5 space-y-1">
                        <li>This quotation is valid for 15 days from the date issued.</li>
                        <li>50% advance payment is required to confirm the order.</li>
                        <li>Balance payment must be made upon project completion.</li>
                        <li>Installation timeline depends on site readiness and material availability.</li>
                        <li>Warranty will be provided as per manufacturer policy.</li>
                        <li>Any additional work outside this quotation will be charged separately.</li>
                    </ol>
                </div>

                {/* SIGNATURE */}
                <div className="flex justify-end mt-12 border-t-2 border-black pt-6">
                    <div className="text-center w-[200px]">
                        <p>For Lumiwaves Automation</p>
                        <div className="h-16"></div>
                        <p className="border-t border-black pt-1">Authorized Signature</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EstimationPage;