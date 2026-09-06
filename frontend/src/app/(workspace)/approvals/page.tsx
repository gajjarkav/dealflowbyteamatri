"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Clock, ShieldCheck, Timer } from "lucide-react";

import { BentoCard, BentoGrid, BentoHeader, EmptyState, PageHeader, StatCard } from "@/components/bento/bento";
import { RiskBadge, StatusBadge } from "@/components/layout/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApprovals } from "@/hooks/use-dealflow";
import { dateLabel, money, num, titleCase } from "@/lib/format";



const tabs = ["pending", "approved", "returned", "rejected", "all"];

export default function ApprovalsPage() {
  const { data, isLoading } = useApprovals();
  const [tab, setTab] = useState("pending");

  const requests = useMemo(
    () => (data ?? []).filter((request) => tab === "all" || request.status === tab),
    [data, tab],
  );

  const pending = (data ?? []).filter((r) => r.status === "pending");
  const breaching = pending.filter((r) => r.slaHoursLeft <= 4);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Approvals"
        title="Approval queue"
        description="Requests waiting on you and your team, sorted so the ones nearest their SLA surface first."
      />

      <BentoGrid>
        <StatCard label="Pending" value={num(pending.length)} icon={ShieldCheck} tint="ember" />
        <StatCard label="Value held" value={money(pending.reduce((s, r) => s + r.amount, 0), "EUR", true)} tint="honey" delay={0.05} />
        <StatCard label="SLA at risk" value={num(breaching.length)} hint="under 4h left" icon={Timer} tint="clay" delay={0.1} />
        <StatCard label="High risk" value={num(pending.filter((r) => r.riskScore >= 70).length)} tint="sand" delay={0.15} />
      </BentoGrid>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          {tabs.map((value) => (
            <TabsTrigger key={value} value={value} className="capitalize">
              {value}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <BentoGrid className="lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </BentoGrid>
      ) : requests.length === 0 ? (
        <EmptyState title="Queue is clear" description="Nothing is waiting in this state right now." />
      ) : (
        <BentoGrid className="lg:grid-cols-2">
          {requests.map((request, index) => (
            <BentoCard
              key={request.id}
              interactive
              delay={index * 0.05}
              tint={request.slaHoursLeft <= 4 && request.status === "pending" ? "clay" : "plain"}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{request.reference}</p>
                  <h3 className="mt-1 text-base font-semibold">{request.subject}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {titleCase(request.type)} · requested by {request.requestedBy} · {dateLabel(request.requestedAt)}
                  </p>
                </div>
                <StatusBadge status={request.status} />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="mt-0.5 font-medium">{money(request.amount, request.currency, true)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Risk</p>
                  <div className="mt-0.5">
                    <RiskBadge score={request.riskScore} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">SLA left</p>
                  <p className="mt-0.5 inline-flex items-center gap-1 font-medium">
                    <Clock className="size-3.5" />
                    {request.slaHoursLeft}h
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-1.5">
                {request.steps.map((step, i) => (
                  <span key={step.id} className="flex items-center gap-1.5">
                    <span
                      className={
                        step.state === "approved"
                          ? "rounded-lg bg-moss/20 px-2.5 py-1 text-xs font-medium"
                          : step.state === "pending"
                            ? "rounded-lg bg-honey/30 px-2.5 py-1 text-xs font-medium"
                            : "rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted-foreground"
                      }
                    >
                      {step.name}
                    </span>
                    {i < request.steps.length - 1 ? <span className="text-muted-foreground">→</span> : null}
                  </span>
                ))}
              </div>

              <Button variant="outline" size="sm" className="mt-5 w-full" asChild>
                <Link href={`/approvals/${request.id}`}>
                  Review request
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </BentoCard>
          ))}
        </BentoGrid>
      )}

      <BentoCard tint="sand">
        <BentoHeader title="An approval queue is a latency budget" />
        <p className="text-sm text-muted-foreground">
          Every hour a request waits is an hour the customer waits. If the queue regularly grows past a day, the rules
          are catching too much — tighten the triggers rather than asking approvers to work faster.
        </p>
      </BentoCard>
    </div>
  );
}
