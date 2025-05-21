import React from 'react';
import Notes from './Notes';

/**
 * Example component to demonstrate how to use the Notes component
 */
const NotesExample = () => {
  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Notes Component Examples</h5>
            </div>
            <div className="card-body">
              <h6 className="mb-3">1. Basic Usage (Buttons Only)</h6>
              <div className="example-box p-3 border rounded mb-4">
                <p className="mb-2">This example shows just the buttons for viewing and adding notes:</p>
                <Notes 
                  entityType="lead" 
                  entityId="12345" 
                  entityName="Sample Lead" 
                />
              </div>

              <h6 className="mb-3">2. Embedded Notes Display</h6>
              <div className="example-box p-3 border rounded mb-4">
                <p className="mb-2">This example shows notes directly embedded in the page:</p>
                <Notes 
                  entityType="lead" 
                  entityId="12345" 
                  entityName="Sample Lead" 
                  showButtons={false}
                  showNotes={true}
                  maxHeight={250}
                />
              </div>

              <h6 className="mb-3">3. Project Notes Example</h6>
              <div className="example-box p-3 border rounded mb-4">
                <p className="mb-2">This example shows how to use the component with project entities:</p>
                <Notes 
                  entityType="project" 
                  entityId="67890" 
                  entityName="Sample Project" 
                />
              </div>

              <h6 className="mb-3">4. Custom Table Cell Usage</h6>
              <div className="example-box p-3 border rounded mb-4">
                <p className="mb-2">This example shows how to use the component in a table cell:</p>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>12345</td>
                      <td>Sample Lead</td>
                      <td>
                        <Notes 
                          entityType="lead" 
                          entityId="12345" 
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>67890</td>
                      <td>Sample Project</td>
                      <td>
                        <Notes 
                          entityType="project" 
                          entityId="67890" 
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesExample;
