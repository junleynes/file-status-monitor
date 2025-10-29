
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { LogEntry } from "@/types";
import { format, parseISO } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "./ui/skeleton";

interface LogsTableProps {
  logs: LogEntry[];
  isLoading?: boolean;
}

export function LogsTable({ logs, isLoading = false }: LogsTableProps) {
  
  const getLevelBadgeClass = (level: LogEntry['level']): string => {
    switch (level) {
      case 'AUDIT':
        return 'bg-blue-500/80 border-transparent text-white';
      case 'INFO':
        return 'bg-green-500/80 border-transparent text-white';
      case 'WARN':
        return 'bg-yellow-500/80 border-transparent text-white';
      case 'ERROR':
        return 'bg-red-500/80 border-transparent text-white';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const formatTimestamp = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MM/dd/yyyy hh:mm:ss a");
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <TooltipProvider>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead className="w-[100px]">Level</TableHead>
              <TableHead className="w-[150px]">Actor</TableHead>
              <TableHead className="w-[200px]">Action</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    </TableRow>
                ))
            ) : logs.length > 0 ? (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatTimestamp(log.timestamp)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getLevelBadgeClass(log.level)}>{log.level}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {log.actor}
                  </TableCell>
                  <TableCell>{log.action}</TableCell>
                   <TableCell className="text-muted-foreground text-xs max-w-sm truncate">
                       <Tooltip>
                        <TooltipTrigger asChild>
                          <span>{log.details}</span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-md">
                          <p className="whitespace-pre-wrap">{log.details}</p>
                        </TooltipContent>
                      </Tooltip>
                   </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
