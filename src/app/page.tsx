"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Trash2,
  Download,
  Printer,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Calculator,
  FileText,
  Zap,
} from "lucide-react"

interface InvoiceItem {
  id: string
  product: string
  quantity: number
  price: number
  tax: number
}

interface CustomerInfo {
  name: string
  address: string
  email: string
  phone: string
}

export default function InvoiceGenerator() {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    address: "",
    email: "",
    phone: "",
  })

  const [items, setItems] = useState<InvoiceItem[]>([{ id: "1", product: "", quantity: 1, price: 0, tax: 0 }])

  const [discount, setDiscount] = useState(0)
  const [paymentMode, setPaymentMode] = useState("")
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [gstNumber, setGstNumber] = useState("");
  const [showPreview, setShowPreview] = useState(false)

  // Generate unique invoice number on component mount
  useEffect(() => {
    const generateInvoiceNumber = () => {
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")
      return `LW-${year}${month}${day}-${random}`
    }
    setInvoiceNumber(generateInvoiceNumber())
  }, [])

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      product: "",
      quantity: 1,
      price: 0,
      tax: 0,
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0)
  }

  const calculateTotalTax = () => {
    return items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.price
      return sum + (itemTotal * item.tax) / 100
    }, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const tax = calculateTotalTax()
    const discountAmount = (subtotal * discount) / 100
    return subtotal + tax - discountAmount
  }

  const handleDownloadPDF = () => {
    // In a real implementation, you would use a library like jsPDF or react-pdf
    alert("PDF download functionality would be implemented here using jsPDF or similar library")
  }

  const handlePrint = () => {
    // Add a class to body so you can control print-mode (optional)
    document.body.classList.add("printing-invoice");

    // Let the browser settle styles, then print
    setTimeout(() => {
      window.print();
    }, 200);

    // Cleanup after print
    const afterPrintHandler = () => {
      document.body.classList.remove("printing-invoice");
      window.removeEventListener("afterprint", afterPrintHandler);
      // For older browsers
      window.onafterprint = null;
    };

    // Modern browsers
    window.addEventListener("afterprint", afterPrintHandler);

    // Fallback for older browsers
    window.onafterprint = afterPrintHandler;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/5">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-mono text-primary">Lumiwaves Automation</h1>
                <p className="text-sm text-muted-foreground">Smart Living, Simplified</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              Invoice Generator
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* GST Number */}
        <div className="space-y-2 text-primary text-sm font-medium max-w-[400px]">
          <Label htmlFor="gstNumber" className="text-sm font-medium">
            GST Number
          </Label>
          <Input
            id="gstNumber"
            placeholder="Enter GST number"
            value={gstNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGstNumber(e.target.value)}
            className="transition-all duration-200 focus:ring-2 focus:ring-accent/50"
          />
        </div>
        <div className="grid lg:grid-cols-2 gap-8">

          {/* Invoice Form */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className="bg-primary/5 border-b border-border/50">
                <CardTitle className="flex items-center space-x-2 text-primary">
                  <User className="w-5 h-5" />
                  <span>Customer Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName" className="text-sm font-medium">
                      Customer Name
                    </Label>
                    <Input
                      id="customerName"
                      placeholder="Enter customer name"
                      value={customerInfo.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      className="transition-all duration-200 focus:ring-2 focus:ring-accent/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail" className="text-sm font-medium">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="customerEmail"
                        type="email"
                        placeholder="customer@email.com"
                        value={customerInfo.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-accent/50"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone" className="text-sm font-medium">
                      Phone
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="customerPhone"
                        placeholder="+91 98765 43210"
                        value={customerInfo.phone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                        className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-accent/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentMode" className="text-sm font-medium">
                      Payment Mode
                    </Label>
                    <Select value={paymentMode} onValueChange={setPaymentMode}>
                      <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-accent/50">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="netbanking">Net Banking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerAddress" className="text-sm font-medium">
                    Address
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Textarea
                      id="customerAddress"
                      placeholder="Enter customer address"
                      value={customerInfo.address}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                      className="pl-10 min-h-[80px] transition-all duration-200 focus:ring-2 focus:ring-accent/50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className="bg-primary/5 border-b border-border/50">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-primary">
                    <Package className="w-5 h-5" />
                    <span>Products & Services</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="p-4 border border-border/50 rounded-lg bg-muted/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Item #{index + 1}</span>
                      {items.length > 1 && (
                        <Button
                          onClick={() => removeItem(item.id)}
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Product/Service</Label>
                        <Input
                          placeholder="Enter product name"
                          value={item.product}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(item.id, "product", e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 1)}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Price (₹)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(item.id, "price", Number.parseFloat(e.target.value) || 0)}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Tax (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={item.tax}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(item.id, "tax", Number.parseFloat(e.target.value) || 0)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-muted-foreground">Item Total: </span>
                      <span className="font-semibold text-primary">
                        ₹{(item.quantity * item.price * (1 + item.tax / 100)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t border-border/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="discount" className="text-sm font-medium">
                        Discount (%)
                      </Label>
                      <Input
                        id="discount"
                        type="number"
                        min="0"
                        max="100"
                        value={discount}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDiscount(Number.parseFloat(e.target.value) || 0)}
                        className="transition-all duration-200 focus:ring-2 focus:ring-accent/50"
                      />
                    </div>
                    <div>
                      {/* Add Item */}
                      <div className="space-y-2 flex items-end">
                        <Button onClick={addItem} size="sm" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                          <Plus className="w-4 h-4 mr-1" />
                          Add Item
                        </Button>
                      </div>
                      {/* Show/Hide Preview */}
                      <div className="space-y-2 flex items-end">
                        <Button
                          onClick={() => setShowPreview(!showPreview)}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          {showPreview ? "Hide Preview" : "Show Preview"}
                        </Button>
                      </div>
                    </div>

                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoice Preview */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className="bg-accent/10 border-b border-border/50">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-primary">
                    <Calculator className="w-5 h-5" />
                    <span>Invoice Summary</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handlePrint} size="sm" variant="outline">
                      <Printer className="w-4 h-4 mr-1" />
                      Print
                    </Button>
                    <Button
                      onClick={handleDownloadPDF}
                      size="sm"
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download PDF
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-semibold">₹{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Tax:</span>
                    <span className="font-semibold">₹{calculateTotalTax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Discount ({discount}%):</span>
                    <span className="font-semibold text-destructive">
                      -₹{((calculateSubtotal() * discount) / 100).toFixed(2)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold text-primary">Total Amount:</span>
                    <span className="font-bold text-primary">₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {showPreview && (
              <div id="print-area">
                <Card
                  id="invoice-card"
                  className="shadow-lg border-0 bg-card/50 backdrop-blur-sm print:shadow-none print:border print:bg-white">
                  <CardContent className="p-8 print:p-6">
                    {/* Invoice Header */}
                    <div className="text-center mb-8 print:mb-6">
                      <div className="flex items-center justify-center space-x-3 mb-2">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                          <Zap className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <div>
                          <h1 className="text-3xl font-bold font-mono text-primary">Lumiwaves Automation</h1>
                          <p className="text-muted-foreground">Smart Living, Simplified</p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>No:64 Murugan Koil Street, North Barathipuram, Shanmugapuram, Pondicherry-09</p>
                        <p>Phone: +91 93858 20287 | Email: lumiwaves1@gmail.com</p>
                      </div>
                    </div>

                    <Separator className="mb-6" />

                    {/* Invoice Details */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                      <div>
                        <h3 className="font-semibold text-primary mb-3">Bill To:</h3>
                        <div className="space-y-1 text-sm">
                          <p className="font-medium">{customerInfo.name || "Customer Name"}</p>
                          <p className="text-muted-foreground">{customerInfo.address || "Customer Address"}</p>
                          <p className="text-muted-foreground">{customerInfo.email || "customer@email.com"}</p>
                          <p className="text-muted-foreground">{customerInfo.phone || "Phone Number"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Invoice #: </span>
                            <span className="font-semibold">{invoiceNumber}</span>
                          </div>
                          {gstNumber && <div>
                            <span className="text-muted-foreground">GST #: </span>
                            <span className="font-semibold">{gstNumber}</span>
                          </div>}
                          <div>
                            <span className="text-muted-foreground">Date: </span>
                            <span className="font-semibold">{new Date().toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Payment: </span>
                            <span className="font-semibold capitalize">{paymentMode || "Not Selected"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-8">
                      <div className="border border-border rounded-lg overflow-hidden">
                        <div className="bg-primary/5 px-4 py-3 border-b border-border">
                          <div className="grid grid-cols-12 gap-2 text-sm font-semibold text-primary">
                            <div className="col-span-4">Item</div>
                            <div className="col-span-2 text-center">Qty</div>
                            <div className="col-span-2 text-right">Price</div>
                            <div className="col-span-2 text-right">Tax</div>
                            <div className="col-span-2 text-right">Total</div>
                          </div>
                        </div>
                        <div className="divide-y divide-border">
                          {items.map((item) => (
                            <div key={item.id} className="px-4 py-3">
                              <div className="grid grid-cols-12 gap-2 text-sm">
                                <div className="col-span-4 font-medium">{item.product || "Product Name"}</div>
                                <div className="col-span-2 text-center">{item.quantity}</div>
                                <div className="col-span-2 text-right">₹{item.price.toFixed(2)}</div>
                                <div className="col-span-2 text-right">{item.tax}%</div>
                                <div className="col-span-2 text-right font-semibold">
                                  ₹{(item.quantity * item.price * (1 + item.tax / 100)).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end mb-8">
                      <div className="w-64 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>₹{calculateSubtotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Tax:</span>
                          <span>₹{calculateTotalTax().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Discount ({discount}%):</span>
                          <span>-₹{((calculateSubtotal() * discount) / 100).toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg text-primary">
                          <span>Total:</span>
                          <span>₹{calculateTotal().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-sm text-muted-foreground border-t border-border pt-4">
                      <p className="mb-2">Thank you for choosing Lumiwaves Automation!</p>
                      <p>Authorized Signature: _________________</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card/80 backdrop-blur-sm border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © 2025 Lumiwaves Automation – All Rights Reserved.
        </div>
      </footer>
    </div>
  )
}
