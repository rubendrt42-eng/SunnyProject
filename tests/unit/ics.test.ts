import { describe, expect, it } from "vitest";
import { buildIcsFile } from "@/lib/ics";

describe("buildIcsFile", () => {
  it("produces a valid VEVENT block with escaped text", () => {
    const ics = buildIcsFile({
      uid: "res-1",
      title: "Pilates, Intro",
      description: "Line one\nLine two",
      location: "San Pedro; Nuevo León",
      startsAt: "2026-08-01T09:00:00.000Z",
      endsAt: "2026-08-01T10:00:00.000Z",
    });

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("UID:res-1@sunnyproject");
    expect(ics).toContain("DTSTART:20260801T090000Z");
    expect(ics).toContain("DTEND:20260801T100000Z");
    expect(ics).toContain("SUMMARY:Pilates\\, Intro");
    expect(ics).toContain("DESCRIPTION:Line one\\nLine two");
    expect(ics).toContain("LOCATION:San Pedro\\; Nuevo León");
    expect(ics).toContain("END:VEVENT");
    expect(ics).toContain("END:VCALENDAR");
  });
});
