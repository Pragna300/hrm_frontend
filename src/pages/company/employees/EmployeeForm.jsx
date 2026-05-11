import FormField, { InputClass } from '../../../components/ui/FormField';
import Button from '../../../components/ui/Button';
import { FIELD_GROUPS } from './employeeFormConfig';

const EmployeeForm = ({ form, onChange, onSubmit, saving, isEdit, lookups, onCancel }) => {
  const update = (key, value) => onChange((prev) => ({ ...prev, [key]: value }));

  function renderField(field) {
    if (field.type === 'option') {
      const items = lookups?.[field.source] || [];
      return (
        <select
          className={InputClass}
          value={form[field.key]}
          onChange={(e) => update(field.key, e.target.value)}
        >
          <option value="">— Select —</option>
          {items.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }
    if (field.type === 'select') {
      return (
        <select
          className={InputClass}
          value={form[field.key]}
          onChange={(e) => update(field.key, e.target.value)}
        >
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }
    return (
      <input
        type={field.type || 'text'}
        className={InputClass}
        value={form[field.key]}
        onChange={(e) => update(field.key, e.target.value)}
      />
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-6"
    >
      {FIELD_GROUPS.map((group) => (
        <fieldset key={group.title}>
          <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            {group.title}
          </legend>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {group.fields.map((field) => (
              <FormField
                key={field.key}
                label={field.label}
                required={!isEdit && field.requiredOnCreate}
                hint={isEdit ? field.helpEdit : undefined}
              >
                {renderField(field)}
              </FormField>
            ))}
          </div>
        </fieldset>
      ))}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        )}
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Update employee' : 'Create employee'}
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;
