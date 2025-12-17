"use client";

/* OrderTimeline START */
export default function OrderTimeline({ order }) {
  const getTimelineSteps = () => {
    const steps = [
      {
        label: "Order Placed",
        status: "completed",
        date: order.createdAt,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      {
        label: "In Progress",
        status: order.status === 'pending' ? 'pending' : 'completed',
        date: order.status !== 'pending' ? order.updatedAt : null,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" />
          </svg>
        )
      },
      {
        label: "Delivered",
        status: ['delivered', 'revision', 'completed'].includes(order.status) ? 'completed' : 'pending',
        date: order.deliveredAt,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3" />
          </svg>
        )
      },
      {
        label: "Completed",
        status: order.status === 'completed' ? 'completed' : 'pending',
        date: order.completedAt,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        )
      }
    ];

    // Add revision step if there are revision requests
    if (order.revisionRequests && order.revisionRequests.length > 0) {
      steps.splice(3, 0, {
        label: `Revision ${order.revisionRequests.length > 1 ? `(${order.revisionRequests.length}x)` : ''}`,
        status: order.status === 'revision' ? 'active' : 'completed',
        date: order.revisionRequests[order.revisionRequests.length - 1]?.requestedAt,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        )
      });
    }

    return steps;
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const steps = getTimelineSteps();

  return (
    <div className="bg-base-100 rounded-lg border border-base-300 p-6">
      <h3 className="font-bold text-lg mb-6">Order Progress</h3>

      <ul className="steps steps-vertical w-full">
        {steps.map((step, index) => {
          const stepClasses = [];
          if (step.status === 'completed') stepClasses.push('step-primary');
          if (step.status === 'active') stepClasses.push('step-warning');

          return (
            <li
              key={index}
              className={`step ${stepClasses.join(' ')}`}
              data-content={
                step.status === 'completed' ? '✓' :
                step.status === 'active' ? '●' : ''
              }
            >
              <div className="text-left ml-4">
                <div className="flex items-center gap-2">
                  <span className={`
                    ${step.status === 'completed' ? 'text-primary' : ''}
                    ${step.status === 'active' ? 'text-warning' : ''}
                    ${step.status === 'pending' ? 'text-base-content/30' : ''}
                  `}>
                    {step.icon}
                  </span>
                  <p className={`font-semibold ${
                    step.status === 'pending' ? 'text-base-content/30' : ''
                  }`}>
                    {step.label}
                  </p>
                </div>
                {step.date && (
                  <p className="text-xs text-base-content/60 mt-1 ml-7">
                    {formatDate(step.date)}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Revision Requests Details */}
      {order.revisionRequests && order.revisionRequests.length > 0 && (
        <div className="mt-6 pt-6 border-t border-base-300">
          <h4 className="font-semibold text-sm mb-3">Revision History</h4>
          <div className="space-y-3">
            {order.revisionRequests.map((revision, index) => (
              <div key={index} className="bg-warning/5 border border-warning/20 rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-semibold text-warning">
                    Revision #{index + 1}
                  </span>
                  <span className="text-xs text-base-content/60">
                    {formatDate(revision.requestedAt)}
                  </span>
                </div>
                <p className="text-sm text-base-content/80">
                  {revision.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
/* OrderTimeline END */
