# Agent updates (v1)

The site currently simulates five agents in the browser. It does not run actual
agent jobs, read project files for agents, expose an HTTP webhook, or call an
external service. Demo state resets on reload. Existing project file storage is
unchanged.

## Browser adapter

```js
window.werkstattAgents.list();
window.werkstattAgents.applyUpdate({
  agentId: 'nova',
  projectId: 'illuna',
  status: 'running',
  task: 'Layout-Varianten prüfen',
  output: 'Variante 1 ist fertig. Prüfe gerade die mobile Ansicht.'
});
```

Agent IDs: `nova`, `atlas`, `scout`, `echo`, `pico`.
Project IDs: `illuna`, `cloud`, `horizon27`, `brand`, `werkstatt`,
`automations`, `garden`.
Status: `idle`, `running`, `waiting`, `done`, `error`.

`agentId` plus at least one changed field is required. Other fields are optional.
Unknown fields, agent/project IDs, and statuses are rejected. Task text is
limited to 200 characters; output is limited to 4,000. Validation happens before
any mutation. Output is plain text, never executable HTML. The console retains
the most recent 100 entries with reception timestamps.

The first adapter update clears that agent's example log and disables its demo
simulation. Other demo agents keep running. Updating projectId relocates the
robot to a separate dock in the corresponding room, including when several
agents share a project. `list()` returns copies, not mutable internal state.

## Later webhook connection

A browser cannot receive a server-to-server webhook. A later backend can accept
authenticated POST requests, validate the above payload and persist current state
and log events, then deliver them to the private site using SSE, WebSocket or
polling. The frontend transport calls `applyUpdate` for each received event.
Implement signature/token verification, authorized project access, ordering and
retry deduplication in that backend. Keep credentials on the server. There is no
public inbound endpoint or configured secret in this prototype.
