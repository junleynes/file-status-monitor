
"use client";

import { useEffect, useState, useMemo, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import type { LogEntry } from "@/types";
import { Search, X, Download, ListFilter, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getLogs, exportLogsToCsv, clearAllLogs } from "@/lib/actions";
import { LogsTable } from "@/components/logs-table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ALL_LEVELS = ["AUDIT", "INFO", "WARN", "ERROR"];

export default function LogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilters, setLevelFilters] = useState<Set<string>>(new Set(ALL_LEVELS));
  const [isPending, startTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { toast } = useToast();

  const fetchLogs = async () => {
    startTransition(async () => {
      const fetchedLogs = await getLogs();
      setLogs(fetchedLogs);
    });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExport = () => {
    startTransition(async () => {
      const { csv, error } = await exportLogsToCsv(filteredLogs);
      if (error) {
        toast({ title: "Export Failed", description: error, variant: "destructive" });
        return;
      }
      const blob = new Blob([csv!], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      const date = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `audit-logs-${date}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Export Successful", description: "The filtered logs have been downloaded." });
    });
  };

  const handleClearLogs = () => {
    startTransition(async () => {
      await clearAllLogs();
      await fetchLogs(); // Refetch logs
      setIsDeleteDialogOpen(false);
      toast({
        title: "Logs Cleared",
        description: "All audit log entries have been deleted.",
      });
    });
  };

  const filteredLogs = useMemo(() => {
    return logs
      .filter(log => levelFilters.has(log.level))
      .filter(log => 
        log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  }, [logs, levelFilters, searchTerm]);
  
  const toggleLevelFilter = (level: string) => {
    setLevelFilters(prev => {
        const newSet = new Set(prev);
        if (newSet.has(level)) {
            newSet.delete(level);
        } else {
            newSet.add(level);
        }
        return newSet;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Audit Logs</h2>
          <p className="text-muted-foreground">
            Review system and user activity across the application.
          </p>
        </div>
         <div className="flex flex-wrap gap-2">
            <Button onClick={handleExport} disabled={isPending || filteredLogs.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                {isPending ? "Exporting..." : "Export to CSV"}
            </Button>
            {user?.role === 'admin' && (
                <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} disabled={isPending}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear All Logs
                </Button>
            )}
         </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>
                Log Entries
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                    (Showing {filteredLogs.length} of {logs.length} entries)
                </span>
            </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by actor, action, or details..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setSearchTerm('')}>
                   <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  <ListFilter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Level</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {ALL_LEVELS.map((level) => (
                  <DropdownMenuCheckboxItem
                    key={level}
                    checked={levelFilters.has(level)}
                    onCheckedChange={() => toggleLevelFilter(level)}
                  >
                    {level}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
          <LogsTable
            logs={filteredLogs}
            isLoading={isPending}
          />
        </CardContent>
      </Card>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all audit log entries.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearLogs} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
              {isPending ? "Clearing..." : "Yes, delete all logs"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
