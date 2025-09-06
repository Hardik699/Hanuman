import AppNav from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Asset, STORAGE_KEY } from "@/lib/systemAssets";
import { ArrowLeft } from "lucide-react";

export default function DemoDataView() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    const existing = localStorage.getItem(STORAGE_KEY);
    const allAssets: Asset[] = existing ? JSON.parse(existing) : [];
    // Filter to show only demo assets (IDs containing WX-M-001, WX-M-002, etc.)
    const demoAssets = allAssets.filter(asset => 
      asset.id.includes("001") || asset.id.includes("002")
    );
    setAssets(demoAssets);
  }, []);

  const demoSet1 = assets.filter(asset => asset.id.includes("001"));
  const demoSet2 = assets.filter(asset => asset.id.includes("002"));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900">
      <AppNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Demo System Assets</h1>
            <p className="text-slate-400">Loaded demo data for mouse, keyboard, and other hardware</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate("/system-info")}
              className="bg-slate-700 hover:bg-slate-600 text-white flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to System Info
            </Button>
            <Badge variant="secondary" className="bg-slate-700 text-slate-300">
              {assets.length} demo assets
            </Badge>
          </div>
        </header>

        {demoSet1.length > 0 && (
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                Demo Set 1 - Gaming Setup
                <Badge className="bg-blue-600 text-white">
                  {demoSet1.length} items
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-slate-300">ID</TableHead>
                      <TableHead className="text-slate-300">Category</TableHead>
                      <TableHead className="text-slate-300">Vendor</TableHead>
                      <TableHead className="text-slate-300">Serial Number</TableHead>
                      <TableHead className="text-slate-300">Company</TableHead>
                      <TableHead className="text-slate-300">Purchase Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {demoSet1.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-mono text-blue-400">{asset.id}</TableCell>
                        <TableCell className="capitalize text-slate-300">{asset.category.replace('-', ' ')}</TableCell>
                        <TableCell className="text-slate-300">{asset.vendorName}</TableCell>
                        <TableCell className="font-mono text-slate-300">{asset.serialNumber}</TableCell>
                        <TableCell className="text-slate-300">{asset.companyName}</TableCell>
                        <TableCell className="text-slate-300">{asset.purchaseDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {demoSet2.length > 0 && (
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                Demo Set 2 - Office Setup
                <Badge className="bg-green-600 text-white">
                  {demoSet2.length} items
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-slate-300">ID</TableHead>
                      <TableHead className="text-slate-300">Category</TableHead>
                      <TableHead className="text-slate-300">Vendor</TableHead>
                      <TableHead className="text-slate-300">Serial Number</TableHead>
                      <TableHead className="text-slate-300">Company</TableHead>
                      <TableHead className="text-slate-300">Purchase Date</TableHead>
                      <TableHead className="text-slate-300">Special</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {demoSet2.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-mono text-blue-400">{asset.id}</TableCell>
                        <TableCell className="capitalize text-slate-300">{asset.category.replace('-', ' ')}</TableCell>
                        <TableCell className="text-slate-300">{asset.vendorName}</TableCell>
                        <TableCell className="font-mono text-slate-300">{asset.serialNumber}</TableCell>
                        <TableCell className="text-slate-300">{asset.companyName}</TableCell>
                        <TableCell className="text-slate-300">{asset.purchaseDate}</TableCell>
                        <TableCell className="text-slate-300">
                          {asset.vonageNumber && (
                            <div className="text-xs">
                              <div>📞 {asset.vonageNumber}</div>
                              <div>Ext: {asset.vonageExtCode}</div>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {assets.length === 0 && (
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="py-12 text-center">
              <p className="text-slate-400 text-lg">No demo data found.</p>
              <p className="text-slate-500 mt-2">
                Go back to System Info and click "Load Demo Data" to create sample assets.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
