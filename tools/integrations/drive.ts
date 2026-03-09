import { Type } from "@sinclair/typebox";
import { get, post, put, patch, del } from "../../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function register(api: any) {
  api.registerTool({
    name: "drive_list_files",
    description: "List files and folders in the agent's Google Drive.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent whose Google Drive to query" }),
      max_results: Type.Optional(Type.Integer({ description: "Maximum items to return (default 20)" })),
      query: Type.Optional(Type.String({ description: "Drive query string (e.g. \"name contains 'report'\")" })),
      folder_id: Type.Optional(Type.String({ description: "Restrict results to a specific folder ID" })),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/integrations/drive/files", p));
    },
  });

  // upload endpoint restored per updated OpenAPI.  The server will
  // accept either multipart/form-data (with a binary `file` field) or a
  // JSON payload containing a base64-encoded `content` string.  This makes
  // programmatic uploads easier while still working with file uploads from
  // a browser.
  api.registerTool({
    name: "drive_upload_file",
    description: "Upload a file to Google Drive. Provide either `file` (binary) or `content` (base64) along with `agent_id` and optional `parent_id`.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent uploading the file" }),
      file: Type.Optional(Type.String({ format: "binary", description: "Binary file contents" })),
      content: Type.Optional(Type.String({ description: "Base64‑encoded file contents; tool will send JSON when provided" })),
      parent_id: Type.Optional(Type.String({ description: "Parent folder ID; uploads to root if omitted" })),
    }),
    async execute(_id: string, p: any) {
      // prefer JSON body when content field is used
      if (p.content !== undefined) {
        // send entire payload as JSON
        return json(await post("/integrations/drive/files", p));
      }
      // otherwise assume binary and let client handle form-data
      return json(await post("/integrations/drive/files", p));
    },
  });

  api.registerTool({
    name: "drive_download_file",
    description: "Download the content of a Google Drive file as text (for text-based files) or a base64-encoded string (for binary files).",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent performing the request" }),
      file_id: Type.String({ description: "Google Drive file ID" }),
      mime_type: Type.Optional(
        Type.String({ description: "Export MIME type for Google Workspace files (e.g. 'text/csv' for Sheets, 'text/plain' for Docs)" }),
      ),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/integrations/drive/files/download", p));
    },
  });

  api.registerTool({
    name: "drive_get_file",
    description: "Get metadata for a specific Google Drive file or folder.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent performing the request" }),
      file_id: Type.String({ description: "Google Drive file ID" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await get(`/integrations/drive/files/${encodeURIComponent(p.file_id)}`, {
          agent_id: p.agent_id,
        }),
      );
    },
  });

  // upload endpoint removed from server API; POST /drive/files now returns 405.
  // If upload support is restored, re-add a tool with the correct path and method.

  api.registerTool({
    name: "drive_update_file",
    description: "Update the content or metadata of an existing Google Drive file.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent performing the update" }),
      file_id: Type.String({ description: "Google Drive file ID to update" }),
      name: Type.Optional(Type.String({ description: "New file name" })),
      content: Type.Optional(Type.String({ description: "New file content (UTF-8 string or base64-encoded bytes)" })),
      mime_type: Type.Optional(Type.String({ description: "MIME type of the new content" })),
      encoding: Type.Optional(Type.String({ description: "'utf8' or 'base64'" })),
    }),
    async execute(_id: string, p: any) {
      const { file_id, ...body } = p;
      return json(await put(`/integrations/drive/files/${encodeURIComponent(file_id)}`, body));
    },
  });

  api.registerTool({
    name: "drive_delete_file",
    description: "Move a Google Drive file or folder to the trash.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent deleting the file" }),
      file_id: Type.String({ description: "Google Drive file ID to delete" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await del(`/integrations/drive/files/${encodeURIComponent(p.file_id)}`, {
          agent_id: p.agent_id,
        }),
      );
    },
  });

  api.registerTool({
    name: "drive_create_folder",
    description: "Create a new folder in Google Drive.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent creating the folder" }),
      name: Type.String({ description: "Folder name" }),
      parent_id: Type.Optional(Type.String({ description: "Parent folder ID; creates in root if omitted" })),
    }),
    async execute(_id: string, p: any) {
      // server expects parent_id field
      return json(await post("/integrations/drive/folders", p));
    },
  });

  api.registerTool({
    name: "drive_move_file",
    description: "Move a Google Drive file to a different folder.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent performing the move" }),
      file_id: Type.String({ description: "ID of the file to move" }),
      new_parent_id: Type.String({ description: "ID of the target parent folder" }),
    }),
    async execute(_id: string, p: any) {
      const { file_id, ...body } = p;
      return json(
        await api.patch(`/integrations/drive/files/${encodeURIComponent(file_id)}/move`, body),
      );
    },
  });

  api.registerTool({
    name: "drive_rename_file",
    description: "Rename a file or folder in Google Drive.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent performing the rename" }),
      file_id: Type.String({ description: "ID of the file or folder" }),
      new_name: Type.String({ description: "New name" }),
    }),
    async execute(_id: string, p: any) {
      const { file_id, ...body } = p;
      return json(
        await api.patch(`/integrations/drive/files/${encodeURIComponent(file_id)}/rename`, body),
      );
    },
  });

  // additional management endpoints
  api.registerTool({
    name: "drive_list_folders",
    description: "List folders in Google Drive (optionally under a parent).",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent whose Drive to query" }),
      max_results: Type.Optional(Type.Integer({ description: "Maximum items to return (default 50)" })),
      parent_id: Type.Optional(Type.String({ description: "Restrict to a specific parent folder" })),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/integrations/drive/folders", p));
    },
  });

  api.registerTool({
    name: "drive_delete_folder",
    description: "Delete a folder (moves it to trash).",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent deleting the folder" }),
      folder_id: Type.String({ description: "ID of the folder to delete" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await del(`/integrations/drive/folders/${encodeURIComponent(p.folder_id)}`, {
          agent_id: p.agent_id,
        }),
      );
    },
  });

  api.registerTool({
    name: "drive_rename_folder",
    description: "Rename a folder in Google Drive.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent performing the rename" }),
      folder_id: Type.String({ description: "ID of the folder" }),
      new_name: Type.String({ description: "New folder name" }),
    }),
    async execute(_id: string, p: any) {
      const { folder_id, ...body } = p;
      return json(
        await api.patch(`/integrations/drive/folders/${encodeURIComponent(folder_id)}/rename`, body),
      );
    },
  });

  api.registerTool({
    name: "drive_move_folder",
    description: "Move a folder into another parent folder.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent performing the move" }),
      folder_id: Type.String({ description: "ID of the folder to move" }),
      new_parent_id: Type.String({ description: "ID of the target parent folder" }),
    }),
    async execute(_id: string, p: any) {
      const { folder_id, ...body } = p;
      return json(
        await api.patch(`/integrations/drive/folders/${encodeURIComponent(folder_id)}/move`, body),
      );
    },
  });

  api.registerTool({
    name: "drive_share_file",
    description: "Share a Google Drive file or folder with another user.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent sharing the file" }),
      file_id: Type.String({ description: "ID of the file or folder to share" }),
      email: Type.String({ description: "Email address of the person to share with" }),
      role: Type.String({ description: "Permission role: 'reader', 'commenter', or 'writer'" }),
      send_notification: Type.Optional(Type.Boolean({ description: "Whether to send a notification email (default true)" })),
    }),
    async execute(_id: string, p: any) {
      const { file_id, ...body } = p;
      return json(await post(`/integrations/drive/files/${encodeURIComponent(file_id)}/share`, body));
    },
  });
}
