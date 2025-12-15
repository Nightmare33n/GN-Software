"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import config from "@/config";
import Image from "next/image";

export default function CreateGigPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "web-development",
    images: [],
    packages: {
      basic: {
        name: "Basic",
        description: "",
        price: "",
        deliveryDays: "",
        revisions: 1,
        features: [""],
      },
      standard: {
        name: "Standard",
        description: "",
        price: "",
        deliveryDays: "",
        revisions: 2,
        features: [""],
      },
      premium: {
        name: "Premium",
        description: "",
        price: "",
        deliveryDays: "",
        revisions: 3,
        features: [""],
      },
    },
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (formData.images.length + files.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const data = new FormData();
        data.append("file", file);
        const response = await axios.post("/api/upload", data);
        return response.data;
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setFormData({
        ...formData,
        images: [...formData.images, ...uploadedImages],
      });
      toast.success(`${uploadedImages.length} image(s) uploaded`);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleFeatureChange = (packageType, index, value) => {
    const updatedFeatures = [...formData.packages[packageType].features];
    updatedFeatures[index] = value;
    setFormData({
      ...formData,
      packages: {
        ...formData.packages,
        [packageType]: {
          ...formData.packages[packageType],
          features: updatedFeatures,
        },
      },
    });
  };

  const addFeature = (packageType) => {
    setFormData({
      ...formData,
      packages: {
        ...formData.packages,
        [packageType]: {
          ...formData.packages[packageType],
          features: [...formData.packages[packageType].features, ""],
        },
      },
    });
  };

  const removeFeature = (packageType, index) => {
    setFormData({
      ...formData,
      packages: {
        ...formData.packages,
        [packageType]: {
          ...formData.packages[packageType],
          features: formData.packages[packageType].features.filter(
            (_, i) => i !== index
          ),
        },
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate basic package
      if (!formData.packages.basic.price || !formData.packages.basic.deliveryDays) {
        toast.error("Basic package price and delivery days are required");
        setLoading(false);
        return;
      }

      // Prepare data
      const gigData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        images: formData.images.map((img) => ({ url: img.url, key: img.key })),
        packages: {
          basic: {
            ...formData.packages.basic,
            price: parseFloat(formData.packages.basic.price),
            deliveryDays: parseInt(formData.packages.basic.deliveryDays),
            features: formData.packages.basic.features.filter((f) => f.trim()),
          },
        },
      };

      // Add standard package if has price
      if (formData.packages.standard.price && formData.packages.standard.deliveryDays) {
        gigData.packages.standard = {
          ...formData.packages.standard,
          price: parseFloat(formData.packages.standard.price),
          deliveryDays: parseInt(formData.packages.standard.deliveryDays),
          features: formData.packages.standard.features.filter((f) => f.trim()),
        };
      }

      // Add premium package if has price
      if (formData.packages.premium.price && formData.packages.premium.deliveryDays) {
        gigData.packages.premium = {
          ...formData.packages.premium,
          price: parseFloat(formData.packages.premium.price),
          deliveryDays: parseInt(formData.packages.premium.deliveryDays),
          features: formData.packages.premium.features.filter((f) => f.trim()),
        };
      }

      const { data } = await axios.post("/api/gigs", gigData);
      toast.success("Gig created successfully!");
      router.push(`/gigs/${data.gig._id}`);
    } catch (error) {
      console.error("Error creating gig:", error);
      toast.error(error.response?.data?.error || "Failed to create gig");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-4xl mx-auto">
        {/* Create Gig Page START */}

        <div className="space-y-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold">Create New Gig</h1>
            <p className="text-base-content/60 mt-2">
              List a service you want to offer to clients
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="card bg-base-200">
              <div className="card-body space-y-4">
                <h2 className="card-title">Basic Information</h2>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Title *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="I will..."
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    minLength={10}
                    maxLength={100}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Category *</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                  >
                    {config.categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Description *</span>
                    <span className="label-text-alt">
                      {formData.description.length}/2000
                    </span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-32"
                    placeholder="Describe your service in detail..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    minLength={50}
                    maxLength={2000}
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="card bg-base-200">
              <div className="card-body space-y-4">
                <h2 className="card-title">Images</h2>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Upload images (max 10)</span>
                  </label>
                  <input
                    type="file"
                    className="file-input file-input-bordered"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading || formData.images.length >= 10}
                  />
                </div>

                {uploading && (
                  <div className="alert">
                    <span className="loading loading-spinner"></span>
                    <span>Uploading images...</span>
                  </div>
                )}

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <div className="relative h-32 rounded-lg overflow-hidden">
                          <Image
                            src={img.url}
                            alt={`Upload ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          className="btn btn-error btn-xs btn-circle absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                          onClick={() => removeImage(idx)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Packages */}
            {["basic", "standard", "premium"].map((pkgType) => (
              <div key={pkgType} className="card bg-base-200">
                <div className="card-body space-y-4">
                  <h2 className="card-title capitalize">
                    {pkgType} Package {pkgType === "basic" && "*"}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">
                          Price ($) {pkgType === "basic" && "*"}
                        </span>
                      </label>
                      <input
                        type="number"
                        className="input input-bordered"
                        placeholder="50"
                        min="5"
                        value={formData.packages[pkgType].price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            packages: {
                              ...formData.packages,
                              [pkgType]: {
                                ...formData.packages[pkgType],
                                price: e.target.value,
                              },
                            },
                          })
                        }
                        required={pkgType === "basic"}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">
                          Delivery Days {pkgType === "basic" && "*"}
                        </span>
                      </label>
                      <input
                        type="number"
                        className="input input-bordered"
                        placeholder="3"
                        min="1"
                        value={formData.packages[pkgType].deliveryDays}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            packages: {
                              ...formData.packages,
                              [pkgType]: {
                                ...formData.packages[pkgType],
                                deliveryDays: e.target.value,
                              },
                            },
                          })
                        }
                        required={pkgType === "basic"}
                      />
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">
                        Description {pkgType === "basic" && "*"}
                      </span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered"
                      placeholder="What's included in this package?"
                      value={formData.packages[pkgType].description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          packages: {
                            ...formData.packages,
                            [pkgType]: {
                              ...formData.packages[pkgType],
                              description: e.target.value,
                            },
                          },
                        })
                      }
                      required={pkgType === "basic"}
                      minLength={20}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Features</span>
                    </label>
                    {formData.packages[pkgType].features.map((feature, idx) => (
                      <div key={idx} className="join mb-2">
                        <input
                          type="text"
                          className="input input-bordered join-item flex-1"
                          placeholder="e.g. Responsive design"
                          value={feature}
                          onChange={(e) =>
                            handleFeatureChange(pkgType, idx, e.target.value)
                          }
                        />
                        <button
                          type="button"
                          className="btn btn-outline join-item"
                          onClick={() => removeFeature(pkgType, idx)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={() => addFeature(pkgType)}
                    >
                      + Add Feature
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Submit */}
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => router.push("/dashboard")}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || formData.images.length === 0}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Creating...
                  </>
                ) : (
                  "Create Gig"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Create Gig Page END */}
      </section>
    </main>
  );
}
