"use client";

import { useState } from "react";
import apiClient from "@/libs/api";
import { toast } from "react-hot-toast";

/* CustomOfferForm START */
export default function CustomOfferForm({
  conversation,
  clientId,
  onClose,
  onSuccess
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    deliveryDays: "",
    revisions: "1"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.post("/api/offers", {
        clientId,
        conversationId: conversation._id,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        deliveryDays: parseInt(formData.deliveryDays),
        revisions: parseInt(formData.revisions)
      });

      toast.success("Custom offer sent successfully!");
      onSuccess?.(response.data.offer);
      onClose();
    } catch (error) {
      console.error("Error creating custom offer:", error);
      toast.error(error.response?.data?.error || "Failed to create offer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-base-100 border-b border-base-300 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Create Custom Offer</h2>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle"
              disabled={loading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Title</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="E.g., Custom website design with 5 pages"
              className="input input-bordered w-full"
              required
              minLength={10}
              maxLength={100}
              disabled={loading}
            />
            <label className="label">
              <span className="label-text-alt text-base-content/60">
                {formData.title.length}/100 characters
              </span>
            </label>
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Description</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what you will deliver, include details about the project scope, deliverables, etc."
              className="textarea textarea-bordered w-full h-32"
              required
              minLength={20}
              maxLength={2000}
              disabled={loading}
            />
            <label className="label">
              <span className="label-text-alt text-base-content/60">
                {formData.description.length}/2000 characters
              </span>
            </label>
          </div>

          {/* Price and Delivery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Price */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Price ($)</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="99.00"
                className="input input-bordered w-full"
                required
                min={5}
                step={0.01}
                disabled={loading}
              />
            </div>

            {/* Delivery Days */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Delivery (days)</span>
              </label>
              <input
                type="number"
                name="deliveryDays"
                value={formData.deliveryDays}
                onChange={handleChange}
                placeholder="7"
                className="input input-bordered w-full"
                required
                min={1}
                max={90}
                disabled={loading}
              />
            </div>

            {/* Revisions */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Revisions</span>
              </label>
              <input
                type="number"
                name="revisions"
                value={formData.revisions}
                onChange={handleChange}
                placeholder="1"
                className="input input-bordered w-full"
                required
                min={0}
                max={10}
                disabled={loading}
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-base-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Offer Summary</h3>
            <div className="space-y-1 text-sm">
              <p className="flex justify-between">
                <span className="text-base-content/60">Total Price:</span>
                <span className="font-semibold">
                  ${formData.price || "0.00"}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-base-content/60">Delivery Time:</span>
                <span className="font-semibold">
                  {formData.deliveryDays || "0"} day{formData.deliveryDays !== "1" ? "s" : ""}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-base-content/60">Revisions:</span>
                <span className="font-semibold">
                  {formData.revisions || "0"}
                </span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Sending...
                </>
              ) : (
                "Send Offer"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
/* CustomOfferForm END */
