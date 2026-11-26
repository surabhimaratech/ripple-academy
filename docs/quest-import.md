# Quest collection import

Open **Quest journal → Quick add, templates & import**, paste JSON, then choose **Validate & preview**. Review every objective and the total available rewards before **Import these quests**. Import is atomic: no quests are added if any entry fails. Existing IDs cannot be overwritten; imported quests are always incomplete and award nothing.

```json
{
  "format": "ripple-academy-quests",
  "version": 1,
  "quests": [
    {
      "title": "Architect of a Resilient Service",
      "objective": "Explain the architecture and tradeoffs of a notification service.",
      "category": "System Design",
      "description": "Sketch an approach, then explain it aloud.",
      "subtasks": ["Sketch components", "Discuss failures and tradeoffs"],
      "priority": "normal",
      "estimatedMinutes": 60,
      "room": "personal-study",
      "activity": "system-design",
      "xp": 15,
      "gold": 5
    }
  ]
}
```

Required entry fields: `title`, `objective`, `category` (nonempty strings, maximum 120 characters), `xp`, `gold` (whole numbers 0–1,000,000). Optional `id` (unique string, maximum 128 characters) is generated when omitted. Optional `description` and `notes`: strings up to 10,000 characters. `subtasks`: up to 100 nonempty strings of up to 240 characters. `priority`: `low`, `normal`, or `high`. `estimatedMinutes`: integer 1–1440. `room`: `personal-study`, `grand-library`, or `observatory`. `activity`: `system-design`, `ai-engineering`, `outreach`, `reading`, or `writing`. Collections contain 1–100 entries, maximum 250 KB. The `completed` field is rejected. Invalid entries identify their one-based quest number and offending field.

Suggested rewards: small 3–5 XP / 1 gold; standard 8–10 / 2–3; substantial 12–15 / 4–5; major 20–25 / 6–8. Rewards remain configurable. Rest and essential self-care never require gold.

Machine-readable [JSON Schema](quest-collection.schema.json) and [ready-to-import example](quest-collection.example.json) are included. Runtime validation additionally rejects duplicate IDs and whitespace-only required text.

Observatory quests may also use `stargazing`, `astronomy-learning`, `data-analysis`, `scientific-programming`, `experiment` or `observation` as their activity. Optional `courseId` links an existing Curriculum scientific project; ungrouped quests remain valid. The version1 collection format is unchanged.
