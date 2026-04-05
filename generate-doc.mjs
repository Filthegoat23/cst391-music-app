import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, Header, Footer
} from 'docx';
import fs from 'fs';

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, size: 32 })],
    spacing: { before: 300, after: 150 }
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, size: 28 })],
    spacing: { before: 240, after: 120 }
  });
}

function p(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 24 })],
    spacing: { before: 100, after: 100 }
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [new TextRun({ text, size: 24 })],
  });
}

function tableRow(cells, isHeader = false) {
  return new TableRow({
    tableHeader: isHeader,
    children: cells.map((text, i) => new TableCell({
      borders,
      width: { size: i === 0 ? 2500 : 3430, type: WidthType.DXA },
      shading: isHeader ? { fill: "2E5090", type: ShadingType.CLEAR } : { fill: "FFFFFF", type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({
        children: [new TextRun({ text, bold: isHeader, color: isHeader ? "FFFFFF" : "000000", size: 22 })]
      })]
    }))
  });
}

function apiTable(rows) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1500, 2500, 1800, 3560],
    rows: [
      new TableRow({
        tableHeader: true,
        children: ["Method", "Endpoint", "Access", "Description"].map((text, i) =>
          new TableCell({
            borders,
            width: { size: [1500, 2500, 1800, 3560][i], type: WidthType.DXA },
            shading: { fill: "2E5090", type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 20 })] })]
          })
        )
      }),
      ...rows.map(([method, endpoint, access, desc]) =>
        new TableRow({
          children: [method, endpoint, access, desc].map((text, i) =>
            new TableCell({
              borders,
              width: { size: [1500, 2500, 1800, 3560][i], type: WidthType.DXA },
              shading: { fill: "FFFFFF", type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun({ text, size: 20 })] })]
            })
          )
        })
      )
    ]
  });
}

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  styles: {
    default: { document: { run: { font: "Calibri", size: 24 } } },
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          children: [new TextRun({ text: "CST-391 \u2013 Music App: Playlist Feature with RBAC", size: 20, color: "666666" })],
          alignment: AlignmentType.RIGHT
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          children: [
            new TextRun({ text: "Filiberto Meraz  |  ", size: 18, color: "888888" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "888888" })
          ],
          alignment: AlignmentType.CENTER
        })]
      })
    },
    children: [
      // Title
      new Paragraph({
        children: [new TextRun({ text: "CST-391 Milestone 4: New Feature \u2013 Database and API Implementation", bold: true, size: 40 })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 200 }
      }),
      new Paragraph({
        children: [new TextRun({ text: "Filiberto Meraz  |  James Sparks  |  Music App \u2013 Playlist Feature with RBAC", size: 22, color: "444444" })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 400 }
      }),

      // 1. Feature Proposal
      h1("1. Feature Proposal"),
      p("I added a Playlist feature to the music app. This lets users create and manage personal playlists of their favorite songs. Admins can view all playlists, delete inappropriate ones, and see statistics about usage."),
      p("This feature is valuable because it helps users organize their music and lets admins moderate content. It demonstrates RBAC by giving different permissions to customers vs admins. Authentication (user_id / roles) is designed into the schema and will be enforced in a future milestone."),

      // 2. User Stories
      h1("2. User Stories"),
      h2("Customer"),
      bullet("As a customer, I want to create playlists so I can organize my favorite songs."),
      bullet("As a customer, I want to add songs to my playlists so I can build my collection."),
      bullet("As a customer, I want to rename my playlists to keep them organized."),
      bullet("As a customer, I want to remove songs from a playlist to keep it up to date."),
      bullet("As a customer, I want to delete my playlists so I can keep my library clean."),
      new Paragraph({ spacing: { before: 100 } }),
      h2("Admin"),
      bullet("As an admin, I want to view all playlists so I can moderate content."),
      bullet("As an admin, I want to delete any playlist so I can remove inappropriate content."),
      bullet("As an admin, I want to see playlist statistics so I can understand user activity."),

      // 3. Data Model
      h1("3. Data Model and Design"),
      p("Two new tables were added to the existing music database (which already has albums and tracks tables)."),
      new Paragraph({ spacing: { after: 100 } }),

      h2("New Tables"),
      new Paragraph({ spacing: { after: 80 } }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2500, 3430, 3430],
        rows: [
          tableRow(["Column", "Type", "Notes"], true),
          tableRow(["id", "SERIAL PRIMARY KEY", "Auto-incrementing"]),
          tableRow(["name", "VARCHAR(100) NOT NULL", "Playlist display name"]),
          tableRow(["user_id", "INTEGER (nullable)", "FK to users table (future)"]),
          tableRow(["created_at", "TIMESTAMP DEFAULT NOW()", "Auto-set on insert"]),
        ]
      }),
      new Paragraph({
        children: [new TextRun({ text: "Table: playlists", italics: true, size: 20, color: "666666" })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 240 }
      }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2500, 3430, 3430],
        rows: [
          tableRow(["Column", "Type", "Notes"], true),
          tableRow(["id", "SERIAL PRIMARY KEY", "Auto-incrementing"]),
          tableRow(["playlist_id", "INTEGER NOT NULL", "FK \u2192 playlists(id) CASCADE"]),
          tableRow(["track_id", "INTEGER NOT NULL", "FK \u2192 tracks(id) CASCADE"]),
          tableRow(["position", "INTEGER DEFAULT 0", "Track order in playlist"]),
        ]
      }),
      new Paragraph({
        children: [new TextRun({ text: "Table: playlist_tracks", italics: true, size: 20, color: "666666" })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 240 }
      }),

      h2("SQL Used to Create Tables"),
      new Paragraph({
        children: [new TextRun({
          text:
`CREATE TABLE IF NOT EXISTS "playlists" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL,
  "user_id" INTEGER DEFAULT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "playlist_tracks" (
  "id" SERIAL PRIMARY KEY,
  "playlist_id" INTEGER NOT NULL,
  "track_id" INTEGER NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "playlist_id_FK"
    FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE CASCADE,
  CONSTRAINT "track_id_FK"
    FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE CASCADE
);`,
          font: "Courier New", size: 18
        })],
        shading: { fill: "F4F4F4", type: ShadingType.CLEAR },
        border: { left: { style: BorderStyle.SINGLE, size: 6, color: "2E5090" } },
        indent: { left: 360 },
        spacing: { before: 120, after: 240 }
      }),

      h2("Relationships"),
      bullet("One user has many playlists (user_id is nullable until users table is implemented)"),
      bullet("One playlist has many tracks through the playlist_tracks join table"),
      bullet("One track can appear in many playlists"),
      bullet("Deleting a playlist automatically removes all its playlist_tracks rows (CASCADE)"),
      bullet("Deleting a track automatically removes it from all playlists (CASCADE)"),

      // 4. API Design
      h1("4. API Design"),
      h2("Customer Endpoints"),
      new Paragraph({ spacing: { after: 100 } }),
      apiTable([
        ["GET",    "/api/playlists",                   "Customer", "Get all playlists"],
        ["POST",   "/api/playlists",                   "Customer", "Create a new playlist"],
        ["GET",    "/api/playlists/:id",               "Customer", "Get one playlist with its tracks"],
        ["PUT",    "/api/playlists/:id",               "Customer", "Rename a playlist"],
        ["DELETE", "/api/playlists/:id",               "Customer", "Delete a playlist"],
        ["POST",   "/api/playlists/:id/songs",         "Customer", "Add a track to a playlist"],
        ["DELETE", "/api/playlists/:id/songs/:songId", "Customer", "Remove a track from a playlist"],
      ]),
      new Paragraph({ spacing: { after: 240 } }),

      h2("Admin Endpoints"),
      new Paragraph({ spacing: { after: 100 } }),
      apiTable([
        ["GET",    "/api/admin/playlists",   "Admin", "View all playlists with track counts"],
        ["DELETE", "/api/admin/playlists",   "Admin", "Delete any playlist by ?id= query param"],
        ["GET",    "/api/admin/stats",       "Admin", "Get total playlists, entries, and top tracks"],
      ]),
      new Paragraph({ spacing: { after: 240 } }),

      p("All endpoints are currently open for testing. Future milestone will add auth middleware that checks for a valid session and enforces admin vs. customer role on the routes above."),

      // 5. Security and Route Protection
      h1("5. Security and Route Protection (RBAC Design)"),
      p("Authentication and role-based access control is designed but not yet enforced in code. The schema anticipates future integration via user_id on the playlists table."),
      new Paragraph({ spacing: { after: 100 } }),
      h2("Customer Permissions"),
      bullet("Can create, read, rename, and delete their own playlists"),
      bullet("Can add and remove tracks from their own playlists"),
      bullet("API will check: user_id on playlist matches logged-in user"),
      new Paragraph({ spacing: { after: 100 } }),
      h2("Admin Permissions"),
      bullet("Can view and delete any playlist"),
      bullet("Can view usage statistics"),
      bullet("API will check: user has admin role before allowing access to /api/admin/* routes"),
      new Paragraph({ spacing: { after: 100 } }),
      h2("Future Middleware Example"),
      new Paragraph({
        children: [new TextRun({
          text:
`if (!loggedIn) redirect to /login
if (isAdminRoute && !isAdmin) return 403 Forbidden
if (isPlaylistOwner || isAdmin) allow action`,
          font: "Courier New", size: 18
        })],
        shading: { fill: "F4F4F4", type: ShadingType.CLEAR },
        border: { left: { style: BorderStyle.SINGLE, size: 6, color: "2E5090" } },
        indent: { left: 360 },
        spacing: { before: 120, after: 240 }
      }),

      // 6. Assumptions and Constraints
      h1("6. Assumptions and Constraints"),
      h2("Assumptions"),
      bullet("The albums and tracks tables already exist in the PostgreSQL database"),
      bullet("Authentication system will be added in a future milestone"),
      bullet("user_id on the playlists table is nullable until a users table is implemented"),
      bullet("Using Next.js API routes deployed on Vercel"),
      bullet("Database is PostgreSQL hosted via Vercel Postgres (pgAdmin 4 locally)"),
      new Paragraph({ spacing: { after: 100 } }),
      h2("Constraints"),
      bullet("Playlist names are max 100 characters (enforced by VARCHAR(100))"),
      bullet("No playlist sharing between users (future feature)"),
      bullet("No public/private playlist settings (future feature)"),
      bullet("Max playlists per user and max songs per playlist will be enforced in future milestone"),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("C:/Users/filib/OneDrive/Documents/CST-391/CST-391 Milestone 4 Design Doc.docx", buffer);
  console.log("Done! File saved.");
});
