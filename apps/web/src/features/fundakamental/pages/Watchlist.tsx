// Ported from features-incoming/fundakamental/src/pages/Watchlist.tsx.
//
// Adaptations from the original:
//  - `@/lib/api` -> `../lib/api` (this port's home for the FundaKaMental API
//    client, see lib/api.ts's header comment). All calls below go through
//    `api.watchlists.*`, which already matches this file's original naming
//    (`api.watchlists.getWatchlists()` etc.) — no call-site renames needed.
//  - `@/components/dashboard/DashboardLayout` -> `../components/dashboard/DashboardLayout`
//    (not yet ported by the parallel shared-components task at the time this
//    page was written — see that task's tracking notes; this import will
//    resolve once it lands).
//  - `toast` from `sonner` kept as-is: `sonner` is already a dependency of
//    this app and `<Sonner />` is already mounted in `../FundakamentalApp.tsx`.
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AmountInput from "@/components/ui/amount-input";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, Trash2, TrendingUp, TrendingDown, Target, AlertCircle, Eye, BarChart3, Pencil, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ApproxAmount from "@/components/ApproxAmount";

interface Watchlist {
  id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  color: string | null;
  item_count: number;
}

interface WatchlistItem {
  id: string;
  ticker: string;
  company_name: string | null;
  added_price: number | null;
  target_price: number | null;
  target_price_type: 'BUY' | 'SELL' | 'ALERT' | null;
  notes: string | null;
  tags: string[];
  current_price: number | null;
  change: number | null;
  change_pct: number | null;
  target_distance: number | null;
  target_distance_pct: number | null;
}

interface WatchlistSummary {
  total_items: number;
  tracked_value: number;
  avg_change_pct: number;
  best_performer: { ticker: string; change_pct: number } | null;
  worst_performer: { ticker: string; change_pct: number } | null;
  targets_hit: number;
  targets_near: number;
}

// Indian listings (NSE .NS / BSE .BO) are priced in rupees; everything else
// the app tracks is quoted in US dollars.
const isIndianTicker = (ticker: string) => /\.(NS|BO)$/i.test(ticker || '');
const currencySymbol = (ticker: string) => (isIndianTicker(ticker) ? '₹' : '$');

export default function Watchlist() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState<string | null>(null);
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [summary, setSummary] = useState<WatchlistSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Create watchlist dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [newWatchlistDescription, setNewWatchlistDescription] = useState('');
  const [newWatchlistColor, setNewWatchlistColor] = useState('#5A77AA');

  // Edit / delete the selected watchlist
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editColor, setEditColor] = useState('#5A77AA');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Add item dialog
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [newItemTicker, setNewItemTicker] = useState('');
  const [newItemTargetPrice, setNewItemTargetPrice] = useState('');
  const [newItemTargetType, setNewItemTargetType] = useState<'BUY' | 'SELL' | 'ALERT'>('BUY');
  const [newItemNotes, setNewItemNotes] = useState('');
  const [newItemTags, setNewItemTags] = useState('');

  // Edit an item's target / notes / tags
  const [editItem, setEditItem] = useState<WatchlistItem | null>(null);
  const [editTargetPrice, setEditTargetPrice] = useState('');
  const [editTargetType, setEditTargetType] = useState<'BUY' | 'SELL' | 'ALERT'>('BUY');
  const [editNotes, setEditNotes] = useState('');
  const [editTags, setEditTags] = useState('');
  const [savingItem, setSavingItem] = useState(false);

  const parseTags = (raw: string) => raw.split(',').map((t) => t.trim()).filter(Boolean);

  // Load watchlists on mount
  useEffect(() => {
    loadWatchlists();
     
  }, []);

  // Load items when watchlist selected
  useEffect(() => {
    if (selectedWatchlist) {
      loadWatchlistItems(selectedWatchlist);
      loadWatchlistSummary(selectedWatchlist);
    }
     
  }, [selectedWatchlist]);

  const loadWatchlists = async (keepSelected?: string) => {
    try {
      const data = await api.watchlists.getWatchlists();
      setWatchlists(data);

      // Keep the requested watchlist selected, else the default or first one
      if (data.length > 0) {
        const keep = keepSelected && data.find((w: Watchlist) => w.id === keepSelected);
        const defaultWatchlist = data.find((w: Watchlist) => w.is_default);
        setSelectedWatchlist(keep ? keep.id : defaultWatchlist?.id || data[0].id);
      } else {
        setSelectedWatchlist(null);
      }
    } catch (error) {
      toast.error('Failed to load watchlists');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadWatchlistItems = async (watchlistId: string) => {
    try {
      const data = await api.watchlists.getWatchlistItems(watchlistId, true);
      setItems(data);
    } catch (error) {
      toast.error('Failed to load watchlist items');
      console.error(error);
    }
  };

  const loadWatchlistSummary = async (watchlistId: string) => {
    try {
      const data = await api.watchlists.getWatchlistSummary(watchlistId);
      setSummary(data.summary);
    } catch (error) {
      console.error('Failed to load summary:', error);
    }
  };

  const handleCreateWatchlist = async () => {
    if (!newWatchlistName.trim()) {
      toast.error('Please enter a watchlist name');
      return;
    }

    try {
      await api.watchlists.createWatchlist({
        name: newWatchlistName,
        description: newWatchlistDescription || null,
        color: newWatchlistColor,
        is_default: false,
      });

      toast.success('Watchlist created');
      setCreateDialogOpen(false);
      setNewWatchlistName('');
      setNewWatchlistDescription('');
      setNewWatchlistColor('#5A77AA');

      await loadWatchlists();
    } catch (error) {
      toast.error('Failed to create watchlist');
      console.error(error);
    }
  };

  const openEditDialog = () => {
    const current = watchlists.find((w) => w.id === selectedWatchlist);
    if (!current) return;
    setEditName(current.name);
    setEditDescription(current.description || '');
    setEditColor(current.color || '#5A77AA');
    setEditDialogOpen(true);
  };

  const handleUpdateWatchlist = async () => {
    if (!selectedWatchlist) return;
    if (!editName.trim()) {
      toast.error('Please enter a watchlist name');
      return;
    }

    try {
      await api.watchlists.updateWatchlist(selectedWatchlist, {
        name: editName.trim(),
        description: editDescription.trim() || null,
        color: editColor,
      });
      toast.success('Watchlist updated');
      setEditDialogOpen(false);
      await loadWatchlists(selectedWatchlist);
    } catch (error) {
      toast.error('Failed to update watchlist');
      console.error(error);
    }
  };

  const handleDeleteWatchlist = async () => {
    if (!selectedWatchlist) return;

    try {
      await api.watchlists.deleteWatchlist(selectedWatchlist);
      toast.success('Watchlist deleted');
      setDeleteDialogOpen(false);
      await loadWatchlists();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete watchlist');
      console.error(error);
    }
  };

  const handleAddItem = async () => {
    if (!newItemTicker.trim() || !selectedWatchlist) {
      toast.error('Please enter a ticker symbol');
      return;
    }
    const target = newItemTargetPrice ? parseFloat(newItemTargetPrice) : null;
    if (target !== null && !(target > 0)) {
      toast.error('Target price must be greater than 0');
      return;
    }

    try {
      await api.watchlists.addItemToWatchlist(selectedWatchlist, {
        ticker: newItemTicker.trim().toUpperCase(),
        target_price: target,
        target_price_type: target ? newItemTargetType : null,
        notes: newItemNotes || null,
        tags: parseTags(newItemTags),
      });

      toast.success(`${newItemTicker.trim().toUpperCase()} added to watchlist`);
      setAddItemDialogOpen(false);
      setNewItemTicker('');
      setNewItemTargetPrice('');
      setNewItemNotes('');
      setNewItemTags('');

      await loadWatchlistItems(selectedWatchlist);
      await loadWatchlistSummary(selectedWatchlist);
      await loadWatchlists(selectedWatchlist); // refresh the count on the tab
    } catch (error: any) {
      toast.error(error.response?.data?.detail || error?.message || 'Failed to add item');
      console.error(error);
    }
  };

  const handleRemoveItem = async (itemId: string, ticker: string) => {
    if (!selectedWatchlist) return;

    try {
      await api.watchlists.removeItemFromWatchlist(selectedWatchlist, itemId);
      toast.success(`${ticker} removed from watchlist`);

      await loadWatchlistItems(selectedWatchlist);
      await loadWatchlistSummary(selectedWatchlist);
      await loadWatchlists(selectedWatchlist);
    } catch (error) {
      toast.error('Failed to remove item');
      console.error(error);
    }
  };

  const openEditItem = (item: WatchlistItem) => {
    setEditItem(item);
    setEditTargetPrice(item.target_price ? String(item.target_price) : '');
    setEditTargetType(item.target_price_type || 'BUY');
    setEditNotes(item.notes || '');
    setEditTags((item.tags || []).join(', '));
  };

  const handleUpdateItem = async () => {
    if (!editItem || !selectedWatchlist) return;
    const target = editTargetPrice ? parseFloat(editTargetPrice) : null;
    if (target !== null && !(target > 0)) {
      toast.error('Target price must be greater than 0');
      return;
    }
    setSavingItem(true);
    try {
      await api.watchlists.updateWatchlistItem(selectedWatchlist, editItem.id, {
        target_price: target,
        target_price_type: target ? editTargetType : null,
        notes: editNotes.trim() || null,
        tags: parseTags(editTags),
      });
      toast.success(`${editItem.ticker} updated`);
      setEditItem(null);
      await loadWatchlistItems(selectedWatchlist);
      await loadWatchlistSummary(selectedWatchlist);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update item');
    } finally {
      setSavingItem(false);
    }
  };

  const formatPrice = (price: number | null | undefined, ticker: string) => {
    if (price == null || !Number.isFinite(Number(price))) return 'N/A';
    return `${currencySymbol(ticker)}${Number(price).toLocaleString(isIndianTicker(ticker) ? 'en-IN' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatChange = (change: number | null | undefined, changePct: number | null | undefined) => {
    if (change == null || changePct == null) return 'N/A';

    const color = change >= 0 ? 'text-primary' : 'text-destructive';
    const icon = change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;

    return (
      <div className={`flex items-center gap-1 ${color}`}>
        {icon}
        <span>{change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%)</span>
      </div>
    );
  };

  const getTargetBadge = (item: WatchlistItem) => {
    if (!item.target_price || !item.current_price) return null;

    const distance = item.target_distance_pct || 0;
    let variant: 'default' | 'secondary' | 'destructive' = 'default';
    let text = '';

    if (item.target_price_type === 'BUY') {
      if (item.current_price <= item.target_price) {
        variant = 'default';
        text = 'BUY TARGET HIT';
      } else if (Math.abs(distance) <= 5) {
        variant = 'secondary';
        text = 'NEAR BUY TARGET';
      } else {
        return null;
      }
    } else if (item.target_price_type === 'SELL') {
      if (item.current_price >= item.target_price) {
        variant = 'default';
        text = 'SELL TARGET HIT';
      } else if (Math.abs(distance) <= 5) {
        variant = 'secondary';
        text = 'NEAR SELL TARGET';
      } else {
        return null;
      }
    } else {
      if (Math.abs(distance) <= 1) {
        variant = 'default';
        text = 'ALERT HIT';
      } else if (Math.abs(distance) <= 5) {
        variant = 'secondary';
        text = 'NEAR ALERT';
      } else {
        return null;
      }
    }

    return <Badge variant={variant}>{text}</Badge>;
  };

  const currentWatchlist = watchlists.find(w => w.id === selectedWatchlist);
  // Tracked value sums the prices as quoted — only label a currency when every
  // stock in the list shares it.
  const trackedValueSymbol =
    items.length > 0 && items.every((i) => isIndianTicker(i.ticker)) ? '₹'
    : items.every((i) => !isIndianTicker(i.ticker)) ? '$'
    : '';

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading watchlists...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="xt-title mb-2">Watchlist Manager</h1>
          <p className="text-muted-foreground">Track stocks and set price targets</p>
        </div>

        <div className="flex gap-2">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                New Watchlist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Watchlist</DialogTitle>
                <DialogDescription>Create a new watchlist to organize your stocks</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newWatchlistName}
                    onChange={(e) => setNewWatchlistName(e.target.value)}
                    placeholder="Tech Stocks"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={newWatchlistDescription}
                    onChange={(e) => setNewWatchlistDescription(e.target.value)}
                    placeholder="High-growth technology companies"
                  />
                </div>

                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    type="color"
                    value={newWatchlistColor}
                    onChange={(e) => setNewWatchlistColor(e.target.value)}
                  />
                </div>

                <Button onClick={handleCreateWatchlist} className="w-full">
                  Create Watchlist
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {selectedWatchlist && (
            <Dialog open={addItemDialogOpen} onOpenChange={setAddItemDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stock
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Stock to Watchlist</DialogTitle>
                  <DialogDescription>Add a stock with an optional price target — you'll get an alert on the Alerts page when it's reached.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ticker">Ticker Symbol</Label>
                    <Input
                      id="ticker"
                      value={newItemTicker}
                      onChange={(e) => setNewItemTicker(e.target.value)}
                      placeholder="AAPL"
                      className="uppercase"
                    />
                  </div>

                  <div>
                    <Label htmlFor="targetPrice">Target Price (Optional)</Label>
                    <AmountInput
                      id="targetPrice"
                      symbol={currencySymbol(newItemTicker)}
                      indian={isIndianTicker(newItemTicker)}
                      value={newItemTargetPrice}
                      onChange={(e) => setNewItemTargetPrice(e.target.value)}
                      placeholder="150.00"
                    />
                  </div>

                  {newItemTargetPrice && (
                    <div>
                      <Label htmlFor="targetType">Target Type</Label>
                      <Select value={newItemTargetType} onValueChange={(v: any) => setNewItemTargetType(v)}>
                        <SelectTrigger id="targetType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BUY">Buy Target</SelectItem>
                          <SelectItem value="SELL">Sell Target</SelectItem>
                          <SelectItem value="ALERT">Alert Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={newItemNotes}
                      onChange={(e) => setNewItemNotes(e.target.value)}
                      placeholder="Why are you watching this stock?"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags (Optional, comma-separated)</Label>
                    <Input
                      id="tags"
                      value={newItemTags}
                      onChange={(e) => setNewItemTags(e.target.value)}
                      placeholder="tech, growth, high-risk"
                    />
                  </div>

                  <Button onClick={handleAddItem} className="w-full">
                    Add to Watchlist
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Watchlist Selector */}
      {watchlists.length > 0 && (
        <Tabs value={selectedWatchlist || undefined} onValueChange={setSelectedWatchlist}>
          <TabsList>
            {watchlists.map((watchlist) => (
              <TabsTrigger key={watchlist.id} value={watchlist.id}>
                <div className="flex items-center gap-2">
                  {watchlist.color && (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: watchlist.color }}
                    />
                  )}
                  {watchlist.name}
                  <Badge variant="secondary">{watchlist.item_count}</Badge>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {currentWatchlist && (
        <div className="flex flex-wrap items-center gap-2 -mt-2">
          <Button variant="ghost" size="sm" onClick={openEditDialog}>
            <Pencil className="w-4 h-4 mr-2" />
            Edit “{currentWatchlist.name}”
          </Button>
          {!currentWatchlist.is_default && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      )}

      {/* Edit watchlist */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Watchlist</DialogTitle>
            <DialogDescription>Rename it or change its description and color</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea id="edit-description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="edit-color">Color</Label>
              <Input id="edit-color" type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} />
            </div>

            <Button onClick={handleUpdateWatchlist} className="w-full">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete watchlist */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{currentWatchlist?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the watchlist and the {currentWatchlist?.item_count ?? 0} stock
              {currentWatchlist?.item_count === 1 ? '' : 's'} in it. This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWatchlist}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit an item */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editItem?.ticker}</DialogTitle>
            <DialogDescription>Change the price target, notes or tags. Leave the target empty to remove it.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-target">Target Price</Label>
              <AmountInput id="edit-target" min={0} symbol={currencySymbol(editItem?.ticker || "")} indian={isIndianTicker(editItem?.ticker || "")} value={editTargetPrice} onChange={(e) => setEditTargetPrice(e.target.value)} />
            </div>
            {editTargetPrice && (
              <div>
                <Label htmlFor="edit-target-type">Target Type</Label>
                <Select value={editTargetType} onValueChange={(v: any) => setEditTargetType(v)}>
                  <SelectTrigger id="edit-target-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUY">Buy Target</SelectItem>
                    <SelectItem value="SELL">Sell Target</SelectItem>
                    <SelectItem value="ALERT">Alert Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea id="edit-notes" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
              <Input id="edit-tags" value={editTags} onChange={(e) => setEditTags(e.target.value)} />
            </div>
            <Button onClick={handleUpdateItem} disabled={savingItem} className="w-full">
              {savingItem ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                <p className="xt-metric">{summary.total_items}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Change Since Added</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Needs at least one stock with a recorded add price; 0.00% there was misleading. */}
              {!summary.best_performer ? (
                <p className="xt-metric text-muted-foreground" title="No add price was recorded for these stocks">—</p>
              ) : (
              <div className="flex items-center gap-2">
                {summary.avg_change_pct >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-primary" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-destructive" />
                )}
                <p className={`text-2xl font-bold ${summary.avg_change_pct >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  {(summary.avg_change_pct ?? 0) >= 0 ? '+' : ''}{(summary.avg_change_pct ?? 0).toFixed(2)}%
                </p>
              </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Targets Hit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <p className="xt-metric">{summary.targets_hit}</p>
                {summary.targets_near > 0 && (
                  <Badge variant="secondary">{summary.targets_near} near</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tracked Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <p className="xt-metric">
                  {trackedValueSymbol}{(summary.tracked_value ?? 0).toLocaleString(trackedValueSymbol === '₹' ? 'en-IN' : 'en-US', { maximumFractionDigits: 0 })}
                  {trackedValueSymbol && <ApproxAmount inline amount={summary.tracked_value} from={trackedValueSymbol === '₹' ? 'INR' : 'USD'} className="text-sm" />}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {currentWatchlist?.name || 'Watchlist Items'}
          </CardTitle>
          {currentWatchlist?.description && (
            <CardDescription>{currentWatchlist.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              {selectedWatchlist ? (
                <>
                  <p className="text-muted-foreground mb-4">No stocks in this watchlist</p>
                  <Button onClick={() => setAddItemDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Stock
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground mb-4">You don't have a watchlist yet</p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Watchlist
                  </Button>
                </>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Added Price</TableHead>
                  <TableHead>Current Price</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Distance to Target</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.ticker}
                      {item.company_name && (
                        <div className="text-xs text-muted-foreground">{item.company_name}</div>
                      )}
                    </TableCell>
                    <TableCell>{formatPrice(item.added_price, item.ticker)}</TableCell>
                    <TableCell>
                      {formatPrice(item.current_price, item.ticker)}
                      <ApproxAmount amount={item.current_price} from={isIndianTicker(item.ticker) ? "INR" : "USD"} />
                    </TableCell>
                    <TableCell>{formatChange(item.change, item.change_pct)}</TableCell>
                    <TableCell>
                      {item.target_price ? (
                        <div>
                          <div>{formatPrice(item.target_price, item.ticker)}</div>
                          <Badge variant="outline" className="text-xs">
                            {item.target_price_type}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No target</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.target_distance != null && item.target_distance_pct != null ? (
                        <div>
                          <div className={item.target_distance >= 0 ? 'text-primary' : 'text-destructive'}>
                            {item.target_distance >= 0 ? '+' : ''}{item.target_distance.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ({item.target_distance_pct >= 0 ? '+' : ''}{item.target_distance_pct.toFixed(2)}%)
                          </div>
                          {getTargetBadge(item)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.tags && item.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            to={`/fundakamental/technicals?ticker=${encodeURIComponent(item.ticker)}`}
                            aria-label={`Technical indicators for ${item.ticker}`}
                            title="Technical indicators"
                          >
                            <Activity className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditItem(item)}
                          aria-label={`Edit ${item.ticker}`}
                          title="Edit target, notes and tags"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id, item.ticker)}
                          aria-label={`Remove ${item.ticker}`}
                          title="Remove from watchlist"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  );
}
