"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, useCommandSearch } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import type { SessionUser } from "@/lib/domain";

type ShortcutItem = {
  label: string;
  href: string;
  description: string;
  roles: SessionUser["role"][];
};

export function CommandPalette({
  items,
  userRole,
}: {
  items: ShortcutItem[];
  userRole: SessionUser["role"];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <div className="hidden lg:inline-flex">
        {/* Desktop: anchored dropdown (portal) */}
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger>
            <Button variant="outline" size="sm" className="w-[320px] justify-start gap-2 text-slate-500">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-border text-[11px]">⌘K</span>
              Search commands, products, pages
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-[520px] max-w-2xl p-0" align="start">
            <div className="p-6">
              <Command className="border-0 bg-transparent p-0 shadow-none">
                <CommandInput placeholder="Search pages or actions" className="border border-border bg-background" />
                <CommandResults items={items} userRole={userRole} onOpen={(href) => { router.push(href); setOpen(false); }} />
              </Command>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile: keep dialog/modal for smaller screens */}
      <div className="lg:hidden">
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          Search
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="p-0">
            <DialogHeader className="px-6 pt-6">
              <DialogTitle>Global search</DialogTitle>
              <DialogDescription>Jump to any workspace page.</DialogDescription>
            </DialogHeader>
            <div className="px-6 pb-6">
              <Command className="border-0 bg-transparent p-0 shadow-none">
                <CommandInput placeholder="Search pages or actions" className="border border-border bg-background" />
                <CommandResults items={items} userRole={userRole} onOpen={(href) => { router.push(href); setOpen(false); }} />
              </Command>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

function CommandResults({
  items,
  userRole,
  onOpen,
}: {
  items: ShortcutItem[];
  userRole: SessionUser["role"];
  onOpen: (href: string) => void;
}) {
  const search = useCommandSearch();
  const filteredItems = useMemo(
    () => items.filter((item) => item.roles.includes(userRole)
      && [item.label, item.description].some((value) => value.toLowerCase().includes(search.toLowerCase()))),
    [items, search, userRole],
  );

  return (
    <CommandList>
      {filteredItems.length ? (
        <CommandGroup heading="Pages">
          {filteredItems.map((item) => (
            <CommandItem key={item.href} onSelect={() => onOpen(item.href)}>
              <span>
                <span className="block font-medium">{item.label}</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">{item.description}</span>
              </span>
              <Link href={item.href} className="text-xs font-medium text-accent">
                Open
              </Link>
            </CommandItem>
          ))}
        </CommandGroup>
      ) : (
        <CommandEmpty>No matching pages.</CommandEmpty>
      )}
    </CommandList>
  );
}