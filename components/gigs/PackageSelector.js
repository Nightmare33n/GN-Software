"use client";

import { useState } from "react";

export default function PackageSelector({ packages, onOrder, loading = false }) {
  const [selectedPackage, setSelectedPackage] = useState("basic");

  const packageTypes = [
    { key: "basic", label: "Basic" },
    { key: "standard", label: "Standard" },
    { key: "premium", label: "Premium" },
  ].filter((pkg) => packages[pkg.key] && packages[pkg.key].price);

  const currentPackage = packages[selectedPackage];

  if (!currentPackage) {
    return (
      <div className="text-center py-8 text-base-content/60">
        No packages available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* PackageSelector START */}

      {/* Package Tabs */}
      <div className="tabs tabs-boxed bg-base-200">
        {packageTypes.map((pkg) => (
          <button
            key={pkg.key}
            className={`tab ${selectedPackage === pkg.key ? "tab-active" : ""}`}
            onClick={() => setSelectedPackage(pkg.key)}
          >
            {packages[pkg.key]?.name || pkg.label}
          </button>
        ))}
      </div>

      {/* Package Details Card */}
      <div className="card bg-base-200">
        <div className="card-body">
          {/* Price */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold">
                ${currentPackage.price}
              </h3>
              <p className="text-sm text-base-content/60">
                {currentPackage.deliveryDays} day{currentPackage.deliveryDays !== 1 ? 's' : ''} delivery
              </p>
            </div>
            <div className="badge badge-primary">
              {currentPackage.revisions || 0} revision{currentPackage.revisions !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Description */}
          {currentPackage.description && (
            <p className="text-base-content/80 mb-4">
              {currentPackage.description}
            </p>
          )}

          {/* Features */}
          {currentPackage.features && currentPackage.features.length > 0 && (
            <div className="space-y-2 mb-6">
              <p className="font-semibold text-sm">What's included:</p>
              <ul className="space-y-2">
                {currentPackage.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-success text-lg">✓</span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Order Button */}
          <button
            className="btn btn-primary btn-block"
            onClick={() => onOrder(selectedPackage)}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Processing...
              </>
            ) : (
              `Order ${packages[selectedPackage]?.name || selectedPackage} - $${currentPackage.price}`
            )}
          </button>
        </div>
      </div>

      {/* PackageSelector END */}
    </div>
  );
}
