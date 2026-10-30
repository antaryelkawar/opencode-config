# Chunk report — 3.1c Contact RawData → Provenance unification

## Files changed

### `commons/entity/contact.go`
- `contact.go:43-50` — replaced ad-hoc `RawData map[string]any` field with `Provenance map[string]any`, doc comment mirroring the house style from `asset.go:54-59` (provenance map carried through codec round-trips, Merge reads base confidence from it, nil = absent).
- `contact.go:129-132` — `ToData` doc comment rewritten: no longer claims "stored Data map when present"; now documents typed-field rebuild + `_prov` emitted via Provenance when non-nil.
- `contact.go:133-134` — removed the `if c.RawData != nil { return c.RawData }` shortcut (the update bug: stale raw map shadowing typed mutations).
- `contact.go:157-159` — `ToData` now ends with `if c.Provenance != nil { m["_prov"] = c.Provenance }` before return (mirrors `asset.go:171-173`).
- `contact.go:164-167` — `FromData` doc comment: dropped the stale "raw map is retained in Data" sentence.
- `contact.go:168-183` — `FromData`: removed `c.RawData = data`; added `if v, ok := data["_prov"].(map[string]any); ok { c.Provenance = v }` at the end (mirrors `asset.go:255-257`).
- `Merge` (`contact.go:219-253`): **byte-identical logic** — `MergePolicy{Keys: {"email":"norm","phone":"norm"}}` and the fill-never-overwrite promoted-column block are untouched. Its doc comment had no RawData references (verified).

### `commons/entity/contact_merge_test.go`
RawData → Provenance adaptations (assertions unchanged in meaning):
- `contact_merge_test.go:79-81` ("name nil fill plus prov stamp"): incoming built with `Name` + `Provenance: {"name": {conf: 0.8, source: "llm"}}` instead of `Name` + `RawData` full map.
- `contact_merge_test.go:104-116` ("name refused at lower confidence"): base and incoming now `Name` + `Provenance` maps (conf 0.9 base / 0.7 incoming) instead of RawData maps.
- `contact_merge_test.go:127-140` ("name replaced at strictly higher confidence"): same adaptation (conf 0.9 base / 0.95 incoming).
- `contact_merge_test.go:215-224` ("prov stamped on accepted coordinate fields"): incoming now `Emails` + `Provenance: {"email": {conf: 0.9, source: "derive"}}`; the now-unused `emailWire` variable removed.
- NEW `TestContactMerge_ProvRoundTripConfidenceRefusal` (`contact_merge_test.go:234-263`) — mirrors `TestAssetMerge_ProvRoundTripConfidenceRefusal` (asset_merge_test.go:318-346): base decoded via `FromData` carrying `name` + `_prov.name.conf=0.9`; struct-built incoming `Name="Bobby"` (no prov, conf 0.0) → `ErrNothingNew`, `Name` unchanged "Bob", `ToData()` emits surviving `_prov.name` with conf 0.9.
- NEW `TestContactTypedMutationSurvivesToData` (`contact_merge_test.go:265-286`) — update-bug regression: `FromData` a payload with `name` + `_prov`, mutate `Name = "Bobby"`, `ToData()["name"]` must be `"Bobby"` (with the old RawData shortcut this returned the stale `"Bob"`); surviving `_prov.name` still emitted.

### `commons/entity/contact_test.go`
No changes — zero `RawData` references (line 108 uses `FromData` with a literal map, unaffected).

## Verification (all from `C:\Projects\procrastinator\procrastinator-backend`)

| Command | Exit | Output tail |
|---|---|---|
| `go build ./commons/... ./infra/...` | 0 | (silent) |
| `go vet ./commons/entity/` | 0 | (silent) |
| `go test ./commons/entity/ -count=1` | 0 | `ok  procrastinator-backend/commons/entity  0.160s` |
| `go test ./infra/postgres/ -run Codec -count=1` | 0 | `ok  procrastinator-backend/infra/postgres  0.055s` |

`gofmt -l commons/entity` — my three files are clean (the other listed files — account.go, extraction.go, person.go, etc. — were already unformatted before this chunk; not in my change set, left alone).

All 11 pre-existing `TestContactMergeCoordinates` subtests pass unchanged in meaning; `TestContactValidate`, `TestContactCodecRoundTrip`, `TestContactMerge`, `TestContactCodecLegacyScalar`, and all asset/person/document tests in the package pass.

## Test count
- Before: 13 contact tests (1 top-level `TestContactMergeCoordinates` with 11 subtests + 3 codec/validate tests in contact_test.go)
- After: **15 contact tests** (13 + `TestContactMerge_ProvRoundTripConfidenceRefusal` + `TestContactTypedMutationSurvivesToData`), 11 subtests unchanged.

## Decisions / deviations
- Used struct literals (`Name`/`Emails` + `Provenance`) for the adapted merge tests — they carry only a single field's prov, so `FromData` added no decode-path coverage the assertions didn't already have; used `FromData` for the two new round-trip tests to prove the decode path per the asset reference.
- No deviations from the chunk spec. `api/**` untouched (its 6 compile errors remain for the follow-up chunk). Merge semantics untouched.
