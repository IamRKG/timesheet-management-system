import { Layout } from '../components/layout';

export function Help() {
  return (
    <Layout title="Help Center">
      <div className="mx-auto max-w-3xl">
        <div className="card">
          <h2 className="mb-6 text-2xl font-bold text-navy-700">Help Center</h2>
          
          <div className="space-y-6">
            <section>
              <h3 className="mb-3 text-xl font-semibold text-navy-600">Getting Started</h3>
              <p className="text-gray-700">
                Welcome to the Timesheet Management System! This guide will help you understand how to use the system effectively.
              </p>
            </section>
            
            <section>
              <h3 className="mb-3 text-xl font-semibold text-navy-600">Creating Time Entries</h3>
              <p className="text-gray-700">
                To log your work time, navigate to the Dashboard and click on "Add Time Entry". Fill in the required details including date, start time, end time, and project information.
              </p>
            </section>
            
            <section>
              <h3 className="mb-3 text-xl font-semibold text-navy-600">Managing Timesheets</h3>
              <p className="text-gray-700">
                Timesheets are automatically created when you add time entries. You can view all your timesheets by clicking on "Timesheets" in the navigation menu. From there, you can submit timesheets for approval.
              </p>
            </section>
            
            <section>
              <h3 className="mb-3 text-xl font-semibold text-navy-600">Approval Process</h3>
              <p className="text-gray-700">
                Once you submit a timesheet, your manager will review it. They can either approve or reject it. If rejected, you'll need to make the necessary changes and resubmit.
              </p>
            </section>
            
            <section>
              <h3 className="mb-3 text-xl font-semibold text-navy-600">Contact Support</h3>
              <p className="text-gray-700">
                If you need further assistance, please contact our support team at support@timesheet-system.com or call (555) 123-4567.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}