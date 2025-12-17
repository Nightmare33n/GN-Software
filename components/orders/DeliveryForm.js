"use client";

import { useState } from "react";
import apiClient from "@/libs/api";
import { toast } from "react-hot-toast";

/* DeliveryForm START */
export default function DeliveryForm({ order, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [files, setFiles] = useState([]);

  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      const uploadedFiles = [];

      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await apiClient.post("/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        uploadedFiles.push({
          url: response.data.url,
          name: file.name,
          size: file.size
        });
      }

      setFiles(prev => [...prev, ...uploadedFiles]);
      toast.success(`${uploadedFiles.length} file(s) uploaded`);
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Failed to upload files");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      toast.error("Please upload at least one file");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post(`/api/orders/${order._id}/deliver`, {
        deliveryFiles: files,
        deliveryNote: deliveryNote.trim() || undefined
      });

      toast.success("Order delivered successfully!");
      onSuccess?.(response.data.order);
    } catch (error) {
      console.error("Error delivering order:", error);
      toast.error(error.response?.data?.error || "Failed to deliver order");
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="bg-base-100 rounded-lg border border-base-300 p-6">
      <h3 className="font-bold text-lg mb-4">Deliver Order</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Upload */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Upload Files *</span>
          </label>

          <input
            type="file"
            onChange={handleFileUpload}
            className="file-input file-input-bordered w-full"
            multiple
            disabled={uploading || loading}
          />

          <label className="label">
            <span className="label-text-alt text-base-content/60">
              Upload your completed work files
            </span>
          </label>

          {uploading && (
            <div className="flex items-center gap-2 mt-2">
              <span className="loading loading-spinner loading-sm"></span>
              <span className="text-sm">Uploading...</span>
            </div>
          )}
        </div>

        {/* Uploaded Files List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Uploaded Files ({files.length})</p>
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-base-200 rounded-lg p-3"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-primary shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-base-content/60">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="btn btn-ghost btn-sm btn-circle"
                  disabled={loading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Delivery Note */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Delivery Note (Optional)</span>
          </label>
          <textarea
            value={deliveryNote}
            onChange={(e) => setDeliveryNote(e.target.value)}
            placeholder="Add any additional notes or instructions for the client..."
            className="textarea textarea-bordered h-24"
            maxLength={1000}
            disabled={loading}
          />
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              {deliveryNote.length}/1000 characters
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading || uploading || files.length === 0}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Delivering...
            </>
          ) : (
            "Deliver Order"
          )}
        </button>
      </form>
    </div>
  );
}
/* DeliveryForm END */
