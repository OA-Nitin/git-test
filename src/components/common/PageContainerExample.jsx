import React from 'react';
import PageContainer from './PageContainer';
import './ReportStyle.css';

/**
 * PageContainerExample - Example component showing how to use the PageContainer
 */
const PageContainerExample = () => {
  return (
    <PageContainer title="Example Page">
      <div className="row">
        <div className="col-md-12">
          <h2>Page Container Example</h2>
          <p>This is an example of using the reusable PageContainer component.</p>
          <p>The PageContainer provides a consistent layout structure for all pages in the application.</p>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Features</h5>
            </div>
            <div className="card-body">
              <ul>
                <li>Consistent page header with title and icon</li>
                <li>Responsive layout that works on all screen sizes</li>
                <li>Clean white card design with shadow</li>
                <li>Customizable with additional CSS classes</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Usage</h5>
            </div>
            <div className="card-body">
              <pre className="bg-light p-3 rounded">
                {`<PageContainer
  title="Your Page Title"
  titleIcon="path/to/icon.svg"
  fullWidth={false}
  className="custom-class"
>
  {/* Your page content here */}
</PageContainer>`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default PageContainerExample;
