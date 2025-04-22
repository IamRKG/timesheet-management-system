import { Layout } from '../components/layout';

export function Documentation() {
  return (
    <Layout title="Documentation">
      <div className="mx-auto max-w-3xl">
        <div className="card">
          <h2 className="mb-6 text-2xl font-bold text-navy-700">System Documentation</h2>
          
          <div className="space-y-6">
            <section>
              <h3 className="mb-3 text-xl font-semibold text-navy-600">System Overview</h3>
              <p className="text-gray-700">
                The Timesheet Management System is designed to help organizations track employee work hours, manage project time allocations, and streamline the timesheet approval process.
              </p>
            </section>
            
            <section>
              <h3 className="mb-3 text-xl font-semibold text-navy-600">User Roles</h3>
              <div className="space-y-2">
                <div>
                  <h4 className="font-medium text-navy-700">Employee</h4>
                  <p className="text-gray-700">Can create time entries, submit timesheets, and view their own data.</p>
                </div>
                <div>
                  <h4 className="font-medium text-navy-700">Manager</h4>
                  <p className="text-gray-700">Can approve/reject timesheets for their department and view department reports.</p>
                </div>
                <div>
                  <h4 className="font-medium text-navy-700">Admin</h4>
                  <p className="text-gray-700">Has full access to all system features and can manage users.</p>
                </div>
              </div>
            </section>
            
            <section>
              <h3 className="mb-3 text-xl font-semibold text-navy-600">Timesheet Workflow</h3>
              <ol className="list-decimal pl-5 text-gray-700">
                <li className="mb-2">Employee logs time entries for their work</li>
                <li className="mb-2">Employee submits completed timesheet</li>
                <li className="mb-2">Manager reviews the timesheet</li>
                <li className="mb-2">Manager approves or rejects with comments</li>
                <li className="mb-2">If rejected, employee makes corrections and resubmits</li>
                <li>Once approved, timesheet is finalized</li>
              </ol>
            </section>
            
            <section>
              <h3 className="mb-3 text-xl font-semibold text-navy-600">API Documentation</h3>
              <p className="text-gray-700">
                For developers, our API documentation is available at <a href="#" className="text-navy-600 hover:underline">api-docs.timesheet-system.com</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}