"use client"

import { useState, useRef, useEffect } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Download, Printer } from "lucide-react"
import ToolHeader from "@/components/Header/Header"

interface EstimateItem {
    id: string
    description: string
    quantity: number
    unitPrice: number
}

export default function EstimationPage() {
    const printRef = useRef<HTMLDivElement>(null)

    const [quotationNumber, setQuotationNumber] = useState("")
    const [validTill, setValidTill] = useState("")
    const [customerName, setCustomerName] = useState("")
    const [customerAddress, setCustomerAddress] = useState("")
    const [placeOfSupply, setPlaceOfSupply] = useState("")
    const [gstNumber, setGstNumber] = useState("")

    const [items, setItems] = useState<EstimateItem[]>([
        { id: "1", description: "", quantity: 1, unitPrice: 0 },
    ])

    useEffect(() => {
        const generateNumber = () => {
            const date = new Date()
            return `EST-${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}-${Math.floor(
                Math.random() * 100
            )}`
        }
        setQuotationNumber(generateNumber())
    }, [])

    const addItem = () => {
        setItems([
            ...items,
            { id: Date.now().toString(), description: "", quantity: 1, unitPrice: 0 },
        ])
    }

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter((item) => item.id !== id))
        }
    }

    const updateItem = (
        id: string,
        field: keyof EstimateItem,
        value: string | number
    ) => {
        setItems(
            items.map((item) =>
                item.id === id ? { ...item, [field]: value } : item
            )
        )
    }

    const calculateTotal = () => {
        return items.reduce(
            (sum, item) => sum + item.quantity * item.unitPrice,
            0
        )
    }

    const handleDownloadPDF = async () => {
        const element = printRef.current
        if (!element) return

        const canvas = await html2canvas(element, { scale: 2 })
        const imgData = canvas.toDataURL("image/png")

        const pdf = new jsPDF("p", "mm", "a4")
        const imgWidth = 210
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
        pdf.save(`${quotationNumber}.pdf`)
    }

    const handlePrint = () => {
        window.print()
    }

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
                className="max-w-4xl mx-auto bg-white p-10 text-sm text-black"
            >
                {/* Header */}
                <div className="flex justify-between border-b pb-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold uppercase">
                            Lumiwaves Automation
                        </h1>
                        <p>No:64 Murugan Koil Street, Pondicherry</p>
                        <p>Phone: +91 93858 20287</p>
                        <p>Email: lumiwaves1@gmail.com</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-semibold">QUOTATION</h2>
                        <p>Quotation #: {quotationNumber}</p>
                        <p>Date: {new Date().toLocaleDateString()}</p>
                        <p>Valid Till: {validTill || "—"}</p>
                    </div>
                </div>

                {/* Customer Section */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
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

                    <div>
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

                {/* Items Table */}
                <table className="w-full border text-sm mb-6">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2 text-left">Description</th>
                            <th className="border p-2 text-center">Qty</th>
                            <th className="border p-2 text-right">Unit Price</th>
                            <th className="border p-2 text-right">Amount</th>
                            <th className="border p-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id}>
                                <td className="border p-2">
                                    <Input
                                        value={item.description}
                                        onChange={(e) =>
                                            updateItem(item.id, "description", e.target.value)
                                        }
                                    />
                                </td>
                                <td className="border p-2 text-center">
                                    <Input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) =>
                                            updateItem(item.id, "quantity", Number(e.target.value))
                                        }
                                    />
                                </td>
                                <td className="border p-2 text-right">
                                    <Input
                                        type="number"
                                        value={item.unitPrice}
                                        onChange={(e) =>
                                            updateItem(item.id, "unitPrice", Number(e.target.value))
                                        }
                                    />
                                </td>
                                <td className="border p-2 text-right">
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

                <Button onClick={addItem} className="mb-6">
                    <Plus className="w-4 h-4 mr-2" /> Add Item
                </Button>

                {/* Total */}
                <div className="flex justify-end mb-8">
                    <div className="w-64 text-right">
                        <div className="text-lg font-bold">
                            Total: ₹{calculateTotal().toFixed(2)}
                        </div>
                    </div>
                </div>

                {/* Terms & Conditions */}
                <div className="border-t pt-4 text-xs leading-5">
                    <h3 className="font-semibold mb-2">Terms & Conditions</h3>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>This quotation is valid for 15 days.</li>
                        <li>50% advance payment required.</li>
                        <li>Delivery timeline depends on material availability.</li>
                        <li>Warranty applicable as per product manufacturer.</li>
                    </ul>
                </div>

                {/* Signature */}
                <div className="flex justify-end mt-12">
                    <div className="text-center">
                        <p>For Lumiwaves Automation</p>
                        <div className="h-16"></div>
                        <p className="border-t pt-1">Authorized Signature</p>
                    </div>
                </div>
            </div>
        </div>
    );
};