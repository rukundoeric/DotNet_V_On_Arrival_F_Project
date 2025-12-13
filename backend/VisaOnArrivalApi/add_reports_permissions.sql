-- Add Reports Permissions
INSERT INTO Permissions (Name, Description, Category, IsActive)
SELECT 'reports.view', 'View reports and analytics', 'reports', 1
WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'reports.view');

INSERT INTO Permissions (Name, Description, Category, IsActive)
SELECT 'reports.export', 'Export reports data', 'reports', 1
WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'reports.export');
