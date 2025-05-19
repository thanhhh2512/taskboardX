# Table Components

This directory contains the modular components used to build the DataTable in the application.

## Component Structure

- **DataTableContent**: Renders the actual table with rows and cells
- **DataTableFilters**: Handles filter panel for mobile and desktop views
- **DataTableHeader**: Contains the header section with search and column visibility controls
- **DataTablePagination**: Displays pagination controls and results count
- **DeleteConfirmDialog**: Confirmation dialog for task deletion

## Usage

These components are composed together in the main `Table.tsx` file. By breaking the table into smaller, focused components, we achieve:

1. Better code organization
2. Improved maintainability
3. Easier performance optimization
4. Clear separation of concerns

## Example

```tsx
// Example of using the components together
<div>
  <DataTableHeader {...headerProps} />
  <DataTableContent {...contentProps} />
  <DataTablePagination {...paginationProps} />
  <DeleteConfirmDialog {...deleteDialogProps} />
</div>
```
