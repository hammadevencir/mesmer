"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MesmerLoader from "@/components/ui/MesmerLoader";

const PER_PAGE = 8;

export function NewUsersTable({ users = [], loading = false, error = null }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(users.length / PER_PAGE));
  const start = (page - 1) * PER_PAGE;
  const pageUsers = users.slice(start, start + PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [users.length]);

  return (
    <div className="bg-white p-6 lg:p-5 rounded-[20px] border border-[#EED9FF]">
      <h3
        className="text-[24px] font-semibold text-[#1A1A1A] mb-4"
        style={{ fontFamily: "var(--font-nunito-sans)" }}
      >
        New Users
      </h3>
      {error && (
        <p className="text-red-600 text-sm mb-4 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}
      {loading ? (
        <div className="py-12 flex items-center justify-center">
          <MesmerLoader
            variant="wave"
            size="sm"
            message="Loading users…"
          />
        </div>
      ) : users.length === 0 ? (
        <div className="py-12 text-center text-[#757575] text-sm">
          No users yet. Users from the Firestore <code className="bg-gray-100 px-1 rounded">users</code> collection will appear here.
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-[16px] border border-transparent">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#FCEDF8] hover:bg-[#FCEDF8] border-none">
                  <TableHead className="py-4 px-6 text-sm font-medium text-[#1A1A1A] h-auto rounded-tl-[12px]">
                    Name
                  </TableHead>
                  <TableHead className="py-4 px-6 text-sm font-medium text-[#1A1A1A] h-auto">
                    Email
                  </TableHead>
                  <TableHead className="py-4 px-6 text-sm font-medium text-[#1A1A1A] h-auto">
                    Last Mood
                  </TableHead>
                  <TableHead className="py-4 px-6 text-sm font-medium text-[#1A1A1A] h-auto">
                    Onboarding Date
                  </TableHead>
                  <TableHead className="py-4 px-6 text-sm font-medium text-[#1A1A1A] h-auto rounded-tr-[12px]">
                    Subscription
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="group hover:bg-[#FDFCFD] transition-colors border-b border-[#F2F2F2] last:border-0"
                  >
                    <TableCell className="py-5 px-6 text-sm font-bold text-[#1A1A1A]">
                      {user.name || "Guest User"}
                    </TableCell>
                    <TableCell className="py-5 px-6 text-sm text-[#757575]">
                      {user.email}
                    </TableCell>
                    <TableCell className="py-5 px-6 text-sm text-[#757575]">
                      {user.lastMood}
                    </TableCell>
                    <TableCell className="py-5 px-6 text-sm text-[#757575]">
                      {user.onboardingDate}
                    </TableCell>
                    <TableCell className="py-5 px-6 text-sm text-[#757575]">
                      {user.subscription}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F2F2F2]">
            <p className="text-sm text-[#757575]">
              Showing {start + 1}–{Math.min(start + PER_PAGE, users.length)} of {users.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-[#1A1A1A] hover:bg-[#FDFCFD] disabled:opacity-50 disabled:pointer-events-none border border-[#EDEDED]"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-sm text-[#757575] px-2">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-[#1A1A1A] hover:bg-[#FDFCFD] disabled:opacity-50 disabled:pointer-events-none border border-[#EDEDED]"
                aria-label="Next page"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
