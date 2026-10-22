# AKOM — UI dan kesiapan backend

Dokumen kerja berkelanjutan. Revisi **R01 — 2026-10-23**. Baseline aplikasi: **`5aecbe52a`**.

Audit domain pendamping: [PRODUCT_AUDIT.md](../PRODUCT_AUDIT.md). Dokumen ini menurunkan temuan domain menjadi inventaris UI, kebutuhan kontrak API, permission, event, dan acceptance criteria. Semua rancangan API dan kebijakan di bawah berstatus **usulan**, bukan keputusan yang telah disetujui atau endpoint yang sudah tersedia.

## 1. Kesimpulan dan batas kesiapan

**UI alur inti cukup untuk memulai vertical slice backend setelah keputusan domain utama disahkan. UI belum lengkap untuk peluncuran sistem kolaborasi.**

Pekerjaan yang sudah dapat menjadi dasar integrasi: pembuatan/detail issue, properti issue, list/board/filter, project, milestone, workflow editor, serta create/edit cycle. Pekerjaan yang masih memerlukan alur tambahan: login/invitation, pemberian akses, intake request, close cycle, file upload nyata, lifecycle archive/restore, notifikasi persisten, dan pengelolaan saved view.

Fondasi backend dapat berjalan paralel dengan pelengkapan UI. Penyusunan schema perlu lebih dahulu menyelesaikan D01–D04. Menghubungkan tombol ke HTTP saja belum menutup gap produk.

**Metode dan batas bukti**

- Pembacaan kode AKOM saat ini dan peninjauan langsung prototype lokal di port 4174, viewport 1280 × 900, persona demo Raka.
- 16 screenshot baru pada audit ini; setiap screenshot diperiksa. Capture saat animasi masih berjalan diganti dengan capture stabil.
- Data port 4174 mengandung fixture pengujian dari sesi sebelumnya. Audit ini menambahkan satu issue `MED-134` berjudul `Backend readiness audit — draft`, mengubah statusnya menjadi Done, menambahkan satu komentar, dan menguji Mark all read. Tidak ada reset data atau upload file.
- Preview Cloudflare dan data browser origin lainnya tidak diubah. Kode aplikasi tidak diubah dalam audit ini.
- API, multi-user concurrency, jaringan gagal, screen reader, dark/mobile, dan backend upstream Plane **tidak diuji** dalam putaran ini. Validasi visual hanya mendukung kondisi yang tampak, bukan klaim aksesibilitas menyeluruh.
- Repository mempunyai tree `apps/api`, tetapi working directory memakai sparse checkout `akom-ui`. Kecocokan endpoint, lisensi/edisi fitur, permission, dan deployment backend Plane belum dipetakan. Keputusan reuse masih terbuka.

## 2. Cara membaca dan memperbarui dokumen

Status UI: **H** = happy path tersedia di prototype; **P** = sebagian alur tersedia; **N** = alur belum tersedia. H tidak berarti sudah siap produksi atau sudah terhubung backend.

Status tindak lanjut: **Open → Decided → In progress → Verified**. Gunakan **Blocked** dengan penyebab konkret bila bergantung pada keputusan lain. **Verified** wajib mempunyai bukti ulang dan referensi commit. Prioritas P0/P1/P2 di sini adalah rekomendasi, bukan persetujuan scope.

- Pertahankan ID `UIB-*`, `D*`, `C*`, dan `AT-*` ketika memperbarui; tambahkan ID baru untuk temuan baru.
- Tambahkan revisi pada changelog, baseline commit, kondisi data uji, dan daftar flow yang diperiksa ulang.
- Simpan evidence baru di `audits/evidence/YYYY-MM-DD/`; gunakan subfolder run jika ada beberapa putaran pada hari yang sama. Jangan menimpa bukti R01 pada audit berikutnya.
- Setiap temuan yang ditutup mencatat keputusan, implementasi, bukti acceptance, dan tanggal. Jangan menganggap screenshot lama membuktikan perubahan terbaru.
- Pembaruan dilakukan saat sesi audit berikutnya diminta atau milestone pekerjaan ditinjau bersama; dokumen ini tidak menjadwalkan audit otomatis.

## 3. Inventaris UI dan aksi

| ID | Area / aksi | UI | Bukti R01 | Yang masih diperlukan untuk backend |
|---|---|---|---|---|
| F01 | Login, logout, sesi kedaluwarsa | N | Kode: persona lokal langsung dipilih | Identitas, sesi, recovery dan loading identitas |
| F02 | Create/switch workspace | H | Kode: createWorkspace/switchWorkspace | API, membership, pemilihan workspace yang masih boleh diakses |
| F03 | Invite, role, revoke anggota | N | Kode membership map; E12 | Administrasi anggota dan invitation lifecycle |
| F04 | Create/join/leave team | H | E12; kode createTeam/joinTeam/leaveTeam | Scope identifier, otorisasi dan kegagalan aksi |
| F05 | Create issue tanpa project | H | E01–E02; MED-134 berhasil dibuat | DTO, identifier server, idempotency, submit/pending/error |
| F06 | Edit title/description/properties | H | E02–E04; status Done tersimpan lokal | Autosave state, version/conflict, event/history, validasi field |
| F07 | Sub-issue dan dependency | P | Kode parentId/blockedBy | Aturan parent, graph cycle, konsekuensi saat pindah scope |
| F08 | Move issue ke project/team | P | Kode Change issue project; team dipilih saat create | Aksi move team, preview dampak dan validasi relasi |
| F09 | Comment dan mention | P | E03; komentar berhasil dibuat | ID komentar, edit/delete, mention ID dan notifikasi |
| F10 | Link/file attachment | P | E03; file metadata-only dinyatakan UI | Upload state, download, retry, storage dan permission |
| F11 | Sharing issue | P | E04 | Kontrol grant/revoke dan daftar siapa mendapat akses |
| F12 | Project create/edit/overview/update | H | E05; kode NewProject/EditProject/postUpdate | Event, timestamp, version, membership dan completion contract |
| F13 | Milestone dan assignment | H | E05; kode MilestoneEditor/Board | Validasi scope, error delete dan transaksi unlink issue |
| F14 | Project workflow editor | H | Kode ProjectWorkflowEditor/Board | Revision, migrasi stage atomik, konflik editor |
| F15 | Cycle create/edit/manage issues | H | E06–E07 | API constraints, version dan histori assignment |
| F16 | Cycle close/carry-over | N | E06; tipe Cycle hanya periode | Dialog keputusan issue tersisa dan closure snapshot |
| F17 | Triage | P | E09 hanya empty state; kode Accept/Dismiss | Jalur submit request, alasan keputusan, routing, notifikasi |
| F18 | Home/My issues/search/filter/list/board | H | E02/E05/E16; kode home-data/filter-menu | Query terotorisasi, pagination, sort/rank dan query errors |
| F19 | Custom view | P | E08/E15–E16 | Owner, visibility, edit, permalink dan restore saat reload |
| F20 | Inbox | P | E10–E11; Mark all read lalu reload diuji | Recipient model, persistent read state, delivery dan dedup |
| F21 | Archive/restore issue/project | N | Kode: tidak ada alur tersebut | Entry point, confirmation, daftar arsip dan restore |
| F22 | Not found / permission denied | N | E14; link issue tidak ada menampilkan Home | State detail khusus, navigasi recovery, aturan 403/404 |
| F23 | Initiative, analytics historis, resource CRUD | N/P | E05/E13; kode | Scope MVP perlu diputuskan; placeholder bukan dukungan fitur |

Baris berbukti kode saja merupakan inventaris implementasi, bukan klaim bahwa happy path-nya dites ulang pada browser dalam R01.

## 4. Register temuan

Semua temuan awal berstatus **Open**. Penanggung jawab di bawah berupa fungsi pekerjaan yang diusulkan, bukan orang yang sudah ditugaskan.

| ID | Prioritas | Temuan dan dampak | Bukti | Penanggung jawab | Selesai bila |
|---|---|---|---|---|---|
| UIB-01 | P0 | Identitas/anggota masih demo; tidak ada login, invitation, role atau revoke | Kode main:175–186, 224–243; E12 | Product + BE + FE | D02 disepakati, sesi dan administrasi akses bekerja pada API/UI |
| UIB-02 | P0 | Form dan autosave belum mempunyai state jaringan; toast sukses lokal belum menandakan penyimpanan server | E01–E03, E07–E08; setState/localStorage | FE + BE | Matriks state di §7 lulus, draft tidak hilang saat gagal |
| UIB-03 | P0 | Completion project berbeda dari cycle/milestone | main:125, 488–489; cycles:42–46 | Product + BE | D01 disahkan, fixture yang sama menghasilkan agregasi yang disepakati |
| UIB-04 | P0 | Perubahan status tidak menambah history; komentar menambah Activity tetapi tanpa identitas/timestamp lengkap | E02–E03; main:256, 652 | BE + FE | State dan event atomik; history dapat ditelusuri actor/waktunya |
| UIB-05 | P0 | Sharing bersifat penjelasan; akses eksternal mengikuti assignee | E04; main:224–225 | Product + BE + FE | Grant/revoke eksplisit dan akses ditolak server setelah dicabut |
| UIB-06 | P0 | Kontrak pindah team/project belum menetapkan dampak cycle, milestone dan stage | main:270–294, 682 | Product + BE + FE | D03 selesai, preview dan transaksi move tidak membuat relasi invalid |
| UIB-07 | P1 | Triage tidak punya jalur submit request; empty state tidak mengarahkan pengajuan | E09; main:290–295, 383 | Product + FE + BE | Submit → accept/decline → assignment/history/notification dapat ditelusuri |
| UIB-08 | P1 | Cycle mempunyai fase kalender tetapi belum dapat ditutup dan memutuskan pekerjaan tersisa | E06–E07; cycles.ts | Product + FE + BE | Close/carry-over konsisten dan hasil cycle lama tetap dapat dilihat |
| UIB-09 | P1 | File hanya nama/ukuran, tanpa upload isi | E03; main:649–670 | FE + BE | Upload/progress/retry/download/delete benar-benar memakai storage |
| UIB-10 | P1 | Mark all read hilang setelah reload; event create yang baru juga hilang dari feed | E10–E11; main:211–212 | BE + FE | Read state per user dan event bertahan lintas refresh/perangkat |
| UIB-11 | P1 | Saved view tidak punya owner/visibility/edit; view aktif kembali ke All issues saat reload | E08/E15–E16; main:136, 201, 285–286 | Product + FE + BE | URL/view ID stabil, query/layout dipulihkan, permission view jelas |
| UIB-12 | P1 | Tidak ada lifecycle archive/restore untuk pekerjaan | Kode model dan aksi utama | Product + FE + BE | Pengguna dapat mengarsipkan, menemukan arsip dan memulihkan tanpa relasi yatim |
| UIB-13 | P1 | /issue/AUDIT-MISSING-000 menampilkan Home tanpa pesan not found | E14; selectedIssue/navigation rendering | FE + BE | Detail hilang/terlarang punya state yang jelas dan recovery |
| UIB-14 | P1 | Komentar tanpa ID/edit/delete; mention berupa nama dalam teks | E03; main:645–652 | FE + BE | Komentar punya lifecycle dan mention yang menunjuk user ID |
| UIB-15 | P1 | Label hanya string yang diturunkan dari issue; tidak ada pusat rename/archive label | main:51, 681; property-controls.tsx | Product + FE + BE | Label ID/scope disepakati, rename tidak memecah referensi |
| UIB-16 | P1 | Query berjalan atas array lokal; Recent/manual belum kontrak timestamp/rank terpisah | E15–E16; filtered/reorderIssue/search | BE + FE | Query paginated dan rank tetap stabil di filter/board berbeda |
| UIB-17 | P1 | Data lokal lama belum punya pilihan import/mapping atau kebijakan tetap sebagai demo | main:137–159, 231–239 | Product + BE | D08 disepakati, preview import/retry/reconciliation diuji bila import dipilih |
| UIB-18 | P2 | Initiative placeholder; resources project dan laporan historis belum alur lengkap | E05/E13 | Product | D09 menetapkan scope; fitur tertunda diberi keterangan yang jujur |

**Reproduksi baru yang terkonfirmasi pada R01**

- UIB-10: Inbox berisi 4 event → Mark all read menghapus badge unread → reload menampilkan 3 event seed sebagai unread. Issue MED-134 dan komentarnya tetap ada dalam data lokal, tetapi event create yang baru tidak ikut bertahan.
- UIB-11: membuka `Shared filters verification` menghasilkan judul view, status In Review/Todo, priority High, Board dan 3 hasil. Reload menghasilkan judul All issues, filter kosong dan List. Record saved view tetap ada dan dapat dibuka lagi dari direktorinya. Ini berbeda dari kehilangan record view.
- UIB-13: direct link issue yang tidak ada menampilkan Home pada URL issue yang tidak valid; tidak ada state not found.

## 5. Keputusan produk yang harus dilacak

Belum ada keputusan pada tabel ini yang dianggap disetujui hanya karena tercantum sebagai rekomendasi.

| ID | Keputusan | Usulan awal | Dampak | Status / pemilik |
|---|---|---|---|---|
| D01 | Sumber kebenaran selesai dan rumus progress | Status canonical menentukan completion; stage tetap dimensi proses; canceled dikeluarkan dari denominator | Issue/status schema, metrik, cycle, milestone, project | Open / Product |
| D02 | Role, scope visibility, guest dan grant | Identity + membership + capability; grant issue terpisah dari assignment | Semua query/mutation, invitation, sharing UI | Open / Product + BE |
| D03 | Issue ownership dan pindah scope | Satu owning team/workspace; project opsional; move menangani cycle/milestone/stage secara atomik | FK, identifier, move dialog | Open / Product + BE |
| D04 | Reuse backend Plane atau backend khusus | Lakukan fit-gap endpoint/schema/permission sebelum memilih | URL/DTO final, auth, deployment, migrasi | Open / Engineering |
| D05 | Entry intake dan keputusan triage | Bedakan create internal dan submit-to-triage; keputusan punya actor/waktu/alasan | Form request, queue, audit dan notification | Open / Product |
| D06 | Cycle close dan histori | Keputusan per issue tersisa: carry-over atau kembali backlog; simpan closure snapshot | Cycle schema, close UI, historical reporting | Open / Product + BE |
| D07 | Private/shared custom view | Owner + visibility + query version + route berbasis ID | Directory, edit/share, authorization | Open / Product |
| D08 | Nasib data localStorage | Perlakukan fixture sebagai demo; import hanya lewat proses eksplisit bila data pengguna perlu dipertahankan | Onboarding/migration tooling | Open / Product |
| D09 | Scope MVP dan fitur lanjutan | Fokus loop issue/project/cycle; putuskan initiative, resource CRUD, formal approval dan analytics terpisah | Backlog dan ekspektasi UI | Open / Product |
| D10 | Parent/sub-issue dan perhitungan | Definisikan apakah parent wajib mengikuti anak dan apakah keduanya dihitung dalam progress | Relasi, completion, estimasi/metrik | Open / Product |

## 6. Peta kontrak layar → command/query → data → permission → event

Nama command/capability lebih stabil daripada bentuk transport. Contoh HTTP berikut hanya rancangan; sesuaikan setelah D04. Prefix scope kandidat: `/api/v1/workspaces/:workspaceId`.

| ID | Layar / aksi | Command/query dan kandidat HTTP | Data minimal yang perlu dipastikan | Capability kandidat | Event / efek |
|---|---|---|---|---|---|
| C01 | Masuk dan memulihkan sesi | GetSession / GET /session | user, memberships, capabilities | Identitas sesi | Session established/expired sebagai lifecycle autentikasi |
| C02 | Workspace/team & anggota | ListWorkspaces, CreateWorkspace, CreateTeam, InviteMember; GET/POST resources terkait | ID, workspaceId, name, membership status/role | workspace:create; workspace:manage_members; team:manage | WorkspaceCreated, TeamCreated, MemberInvited/Joined |
| C03 | Create issue | CreateIssue / POST /issues | title, description document, teamId, projectId nullable, statusId, priority, assigneeId | issue:create dalam team/workspace | IssueCreated; ID/version dari server; idempotency key |
| C04 | List, board, Home, search | ListIssues / GET /issues; GetHome / GET /home | cursor, page size, sort/rank, filter DTO, query scope | issue:read per record; aggregate hanya data berizin | Read model dan cursor; tidak perlu domain event untuk setiap klik filter |
| C05 | Detail/autosave/properti | GetIssue; UpdateIssue / GET/PATCH /issues/:id | field changes, expectedVersion; stable internal ID + display identifier | issue:read; issue:update_work; manage_scope untuk relasi | Event field khusus + canonical state/version |
| C06 | Move dan urutan | PreviewMove, MoveIssue, ReorderIssue / POST /issues/:id/move atau /reorder | target team/project, keputusan relasi, rank context, expectedVersion | issue:manage_scope atau issue:reorder | IssueTeam/ProjectChanged, IssueReordered; relasi invalid ditangani atomik |
| C07 | Parent/dependency | LinkSubIssue, Add/RemoveDependency | parent/dependency ID, relation type, expectedVersion | issue:manage_relations pada objek terkait | SubIssueLinked, DependencyAdded/Removed; cek graph cycle |
| C08 | Komentar/mention | Create/Update/DeleteComment / resource /issues/:id/comments | comment ID, body, mentionedUserIds, expectedVersion bila edit | issue:comment; comment:edit_own/manage | CommentAdded/Edited/Deleted, UserMentioned |
| C09 | Attachment | BeginUpload, CompleteUpload, GetDownload, RemoveAttachment | file metadata, upload token/state, object reference, max size/type | issue:attach/read_attachment | AttachmentAdded/Removed setelah upload terverifikasi |
| C10 | Sharing | List/Create/RevokeIssueGrant / resource /issues/:id/access-grants | grantee user/invitation, capability, expiry opsional, version | issue:manage_access | AccessGranted/Revoked; reader dicabut kehilangan akses |
| C11 | Project/milestone/workflow | Create/UpdateProject; Create/Update/DeleteMilestone; ConfigureWorkflow | teams, lead, dates, stage IDs/categories, expectedVersion | project:manage; workflow:manage | ProjectChanged, MilestoneChanged, ProjectWorkflowConfigured |
| C12 | Project update | PublishProjectUpdate / POST /projects/:id/updates | body, health, actor dari sesi, timestamp server | project:publish_update | ProjectUpdatePublished; penerima mengikuti kebijakan |
| C13 | Cycle dan issue assignment | Create/UpdateCycle; AssignIssueToCycle | team, date-only start/end, cycleId nullable, versions | cycle:manage; issue:plan | CycleCreated/DatesChanged, IssueAddedTo/RemovedFromCycle |
| C14 | Close cycle | PreviewCycleClose, CloseCycle / POST /cycles/:id/close | expectedVersion, keputusan setiap unfinished issue, targetCycleId bila carry-over | cycle:close | CycleClosed, IssueCarriedOver; closure snapshot historis |
| C15 | Request/triage | SubmitToTriage, Accept/DeclineTriage / POST command terkait | requester, owning scope, routing, keputusan/alasan, version | request:submit; triage:review | IssueSubmittedToTriage, TriageAccepted/Declined |
| C16 | Custom view | Create/Update/Delete/GetView / resource /views/:id | owner dari sesi, visibility, query schema version, filters/sort/layout | view:manage_own; view:share/manage | ViewCreated/Updated/Deleted; permalink stabil |
| C17 | Inbox/history | ListNotifications, MarkRead; ListIssueEvents | recipient dari sesi, cursor, readAt; event actor/time/changes | notification:read_self; issue:read_history | NotificationRead; history berasal dari domain events |
| C18 | Archive/restore | Archive/RestoreIssue/Project | expectedVersion, reason opsional, impact relasi | issue/project:archive atau restore | Archived/Restored; arsip keluar dari query aktif |

Aturan bersama:

- Actor, workspace scope, permission dan timestamp ditetapkan/divalidasi server. ID buatan array lokal tidak menjadi allocator produksi.
- Record dan event perubahan disimpan atomik. Pengiriman notification dapat menyusul dengan dedup/idempotency.
- Gunakan version untuk perubahan bersama. Respons konflik membawa cara memuat versi terbaru; jangan otomatis menimpa hasil orang lain.
- Simpan instant sebagai timestamp standar; due/start/end calendar date sebagai date-only. UI membuat teks relatif untuk tampilan.
- Rich-text document memakai schema version dan validasi isi/URL. Permission download mengikuti scope issue.
- Pemindahan cycle tidak boleh menghapus bukti historis cycle sebelumnya. Close snapshot/riwayat membership diperlukan untuk laporan.
- Penghitungan progres/summary menggunakan satu kontrak D01 dan aturan D10, termasuk canceled, archived, dan zero-item.

## 7. State UI yang wajib ditambahkan saat integrasi

| State | Perilaku UI yang dibutuhkan | Acceptance |
|---|---|---|
| Initial loading | Skeleton/spinner sesuai area; hindari menampilkan seed sebagai data nyata | Query belum selesai tidak dianggap empty |
| Empty | Jelaskan scope/filter dan aksi pertama yang relevan | Tidak tertukar dengan gagal fetch atau akses ditolak |
| Validation failure / 422 | Pesan per field, fokus ke error, draft utuh | Field bisa diperbaiki tanpa mengisi ulang form |
| Saving / uploading | Pending state dan cegah duplikasi submit | Retry Create/Comment/Upload tidak membuat duplikat |
| Saved | Tampilkan sukses setelah server mengonfirmasi | Refresh memuat hasil yang sama |
| Network/server failure | Pesan gagal, retry dan draft tetap ada; optimistic update dapat dipulihkan | Tidak ada toast sukses palsu atau kehilangan draft |
| Session expired / 401 | Re-auth dengan draft aman | Pengguna dapat melanjutkan setelah login |
| Permission revoked / 403 atau masked 404 | State akses yang jelas, hentikan mutasi, recovery ke halaman berizin | Konten yang sudah tidak boleh diakses tidak terus tersaji |
| Missing/deleted object / 404 | Not found/archived state dan tombol kembali | URL invalid tidak diam-diam berubah menjadi Home |
| Conflict / 409 atau 412 | Jelaskan konflik, muat versi terbaru, pertahankan draft lokal untuk rekonsiliasi | Dua browser tidak saling menimpa diam-diam |
| Pagination / refresh | Load more/retry parsial; query/filter dan posisi yang relevan dipertahankan | Tidak ada duplikat/hilang baris atau perubahan scope tak disengaja |

Saat ini beberapa validasi lokal sudah ada, terutama cycle dan team identifier. State jaringan di atas belum dibuktikan oleh prototype lokal karena belum ada API yang dihubungkan.

## 8. Permission matrix kandidat

Ini **rancangan**, bukan policy produksi yang sudah disetujui. Jabatan Member.role tidak boleh menjadi dasar otorisasi.

| Aksi | Workspace admin | Member | Guest/grantee issue |
|---|---|---|---|
| Kelola invitation/role/revoke | Ya, sesuai D02 | Tidak secara default | Tidak |
| Baca issue workspace | Sesuai visibility D02 | Sesuai visibility D02 | Hanya issue yang diberi grant |
| Buat issue / submit request | Sesuai capability | Sesuai owning scope | Hanya bila request:submit diberikan |
| Ubah status/komentar | Sesuai capability | Sesuai scope dan D02 | Hanya capability yang diberikan pada grant |
| Pindah team/project/cycle | manage_scope/plan | Bila capability diberikan | Tidak secara default |
| Kelola project/workflow/milestone | project:manage | Lead/role yang diberi capability | Tidak |
| Close cycle | cycle:close | Team lead/role yang diberi capability | Tidak |
| Kelola sharing | manage_access | Bila diberi capability | Tidak secara default |
| Kelola custom view | Milik sendiri/administrasi sesuai policy | Milik sendiri; share mengikuti D07 | Di luar MVP sampai D07 menetapkan |
| Baca/ubah notification | Hanya notification sendiri | Hanya notification sendiri | Hanya notification sendiri |

Policy final perlu mendefinisikan private project/team, scope lintas team, siapa yang boleh menjadi assignee, dan dampak revoke. Itu belum diuji pada server.

## 9. Langkah audit UI dan evidence

| Langkah | Evidence | Yang diperiksa dan kondisi |
|---|---|---|
| 1 | [E01 — create](audits/evidence/2026-10-23/01-create-issue.jpg) | Form tersedia; title wajib dan submit berhasil. Pending/error jaringan belum ada |
| 2 | [E02 — detail](audits/evidence/2026-10-23/02-issue-detail.jpg) | MED-134 berhasil dibuat tanpa project; properti tersedia |
| 3 | [E03 — kolaborasi](audits/evidence/2026-10-23/03-collaboration.jpg) | Status diubah ke Done dan komentar ditambahkan; history status tidak muncul, file dinyatakan metadata-only |
| 4 | [E04 — sharing](audits/evidence/2026-10-23/04-sharing-access.jpg) | Penjelasan scope tampil; grant/revoke UI belum tersedia |
| 5 | [E05 — project](audits/evidence/2026-10-23/05-project-overview.jpg) | Properties/milestone/progress tersedia; resource section masih empty tanpa CRUD |
| 6 | [E06 — cycle](audits/evidence/2026-10-23/06-cycle-planning.jpg) | Planning dan manage issue tersedia; close/carry-over belum tersedia |
| 7 | [E07 — cycle form](audits/evidence/2026-10-23/07-cycle-form.jpg) | Nama/date fields tersedia; draft dibatalkan, tidak membuat cycle |
| 8 | [E08 — custom view](audits/evidence/2026-10-23/08-custom-view.jpg) | Filter/layout/sort tersedia; owner/visibility/edit belum menjadi alur |
| 9 | [E09 — triage](audits/evidence/2026-10-23/09-triage.jpg) | Empty state tersedia; tidak ada submit request. Populated Accept/Dismiss tidak dites ulang dalam R01 |
| 10 | [E10 — inbox](audits/evidence/2026-10-23/10-inbox.jpg) | Feed dan Mark all read tersedia; 4 event sebelum reload |
| 11 | [E11 — inbox reload](audits/evidence/2026-10-23/11-inbox-after-reload.jpg) | Badge kembali unread 3 dan event create baru hilang: masalah persistensi terkonfirmasi |
| 12 | [E12 — team](audits/evidence/2026-10-23/12-team-directory.jpg) | Directory/New team/Leave tersedia; invite/role management tidak ada pada layar ini |
| 13 | [E13 — initiative](audits/evidence/2026-10-23/13-initiatives.jpg) | Placeholder terkonfirmasi; bukan alur implementasi |
| 14 | [E14 — missing route](audits/evidence/2026-10-23/14-missing-issue-route.jpg) | URL issue tidak ada merender Home: recovery belum benar |
| 15 | [E15 — view terbuka](audits/evidence/2026-10-23/15-custom-view-open.jpg) | View tersimpan membuka 3 hasil dengan Board/filter yang sesuai |
| 16 | [E16 — view reload](audits/evidence/2026-10-23/16-custom-view-after-reload.jpg) | Refresh kehilangan konteks aktif dan kembali All issues/List: masalah routing/state terkonfirmasi |

Risiko aksesibilitas yang masih perlu diuji saat integrasi: announcement saving/error/live updates, fokus setelah mutasi memindahkan baris, navigasi keyboard pada list yang dipaginasi, dan pemulihan fokus setelah re-auth/conflict. Screenshot tidak membuktikan perilaku screen reader. Nama field dan heading pada alur yang dikunjungi terbaca dalam accessibility snapshot.

## 10. Acceptance dan urutan tindak lanjut

| ID | Gate | Pemeriksaan yang dibutuhkan | Status R01 |
|---|---|---|---|
| AT-01 | Kontrak domain | D01–D04 mempunyai keputusan tertulis dan contoh edge case | Belum |
| AT-02 | Vertical slice | Login → list → create → edit issue → event → reload dari server | Belum; versi lokal tersedia |
| AT-03 | Authorization | Dua role/dua user; akses scope terlarang dan revoked ditolak API | Belum diuji |
| AT-04 | Reliability UI | 401/403/404/409/422/5xx/offline tidak menghilangkan draft atau memberi sukses palsu | Belum diuji |
| AT-05 | Concurrency | Dua browser mengubah issue yang sama; konflik tertangani dan ID tidak duplikat | Belum diuji |
| AT-06 | Query dan saved view | Pagination/filter/rank konsisten; deep link view mempertahankan query/layout saat reload | Gap UIB-11 terkonfirmasi |
| AT-07 | Kolaborasi | Comment/mention/file/notification persisten dan mengikuti permission | Parsial lokal |
| AT-08 | Planning lifecycle | Request selesai ditriage, cycle ditutup dengan keputusan sisa kerja, metrik historis stabil | Belum |
| AT-09 | Data lifecycle | Archive/restore dan keputusan migrasi data lama diuji | Belum |
| AT-10 | Delivery | Kontrak API diuji otomatis, error telemetry tersedia, backup/recovery dan deployment tervalidasi | Di luar implementasi saat ini |

Urutan pekerjaan yang direkomendasikan:

1. Putuskan D01–D04 dan lakukan fit-gap backend Plane. Output: keputusan reuse, kontrak identity/scope/status dan fixture agregasi.
2. Buat vertical slice AT-02 dengan state UI §7 serta event; selesaikan UIB-13 dan desain identitas route/view.
3. Implementasikan permission dan concurrency bersama API; uji AT-03–AT-05 dengan dua pengguna.
4. Lengkapi intake, cycle closure, notification, komentar/file, saved view dan archive sesuai MVP yang disepakati.
5. Audit ulang memakai gate dan ID yang sama; fitur lanjutan mengikuti keputusan D09.

**Checkpoint sesi berikutnya:** mulai dari D01 (arti selesai), D02 (akses/role), D03 (kepemilikan issue dan move), serta D04 (reuse Plane). Tidak semua UI harus selesai sebelum fondasi backend dimulai.

## 11. Riwayat audit dan template pembaruan

| Revisi | Tanggal | Baseline | Perubahan / bukti | Keputusan diterima |
|---|---|---|---|---|
| R01 | 2026-10-23 | 5aecbe52a | Inventaris 23 area, 18 temuan, 10 keputusan, 18 kelompok kontrak, 16 screenshot; bug reload Inbox/view dan missing-route direproduksi | Belum ada; rekomendasi menunggu pembahasan |

Untuk R02 dan seterusnya, tambahkan catatan:

```text
Revisi/tanggal/baseline:
Scope dan persona/origin:
Keputusan D* yang diterima atau berubah (oleh siapa/kapan):
Temuan UIB-* dibuka/ditutup dan alasan:
Kontrak C* yang berubah:
Acceptance AT-* yang diuji dan hasil:
Folder evidence baru:
Risiko/flow yang belum diperiksa:
Checkpoint berikutnya:
```

## 12. Galeri evidence R01

Seluruh gambar berikut berasal dari sesi audit ini dan menggunakan fixture demo lokal.

<details><summary>Langkah 1–4: issue, komentar dan akses</summary>

![E01 Create issue](audits/evidence/2026-10-23/01-create-issue.jpg)
![E02 Issue detail](audits/evidence/2026-10-23/02-issue-detail.jpg)
![E03 Collaboration](audits/evidence/2026-10-23/03-collaboration.jpg)
![E04 Sharing](audits/evidence/2026-10-23/04-sharing-access.jpg)

</details>

<details><summary>Langkah 5–8: project, cycle dan custom view</summary>

![E05 Project](audits/evidence/2026-10-23/05-project-overview.jpg)
![E06 Cycle](audits/evidence/2026-10-23/06-cycle-planning.jpg)
![E07 Cycle form](audits/evidence/2026-10-23/07-cycle-form.jpg)
![E08 Custom view form](audits/evidence/2026-10-23/08-custom-view.jpg)

</details>

<details><summary>Langkah 9–12: triage, notification dan team</summary>

![E09 Triage](audits/evidence/2026-10-23/09-triage.jpg)
![E10 Inbox](audits/evidence/2026-10-23/10-inbox.jpg)
![E11 Inbox after reload](audits/evidence/2026-10-23/11-inbox-after-reload.jpg)
![E12 Teams](audits/evidence/2026-10-23/12-team-directory.jpg)

</details>

<details><summary>Langkah 13–16: placeholder dan edge case routing</summary>

![E13 Initiative](audits/evidence/2026-10-23/13-initiatives.jpg)
![E14 Missing issue route](audits/evidence/2026-10-23/14-missing-issue-route.jpg)
![E15 Saved view open](audits/evidence/2026-10-23/15-custom-view-open.jpg)
![E16 Saved view reload](audits/evidence/2026-10-23/16-custom-view-after-reload.jpg)

</details>
