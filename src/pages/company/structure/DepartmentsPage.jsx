import { useNavigate } from 'react-router-dom';
import OrgEntityPage from './OrgEntityPage';
import Button from '../../../components/ui/Button';

const DepartmentsPage = () => {
  const navigate = useNavigate();
  return (
    <OrgEntityPage
      resource="/departments"
      title="Departments"
      subtitle="Group your workforce by function or business unit."
      fields={[
        { key: 'name', label: 'Name' },
      ]}
      defaultRow={{ name: '' }}
      actions={<Button onClick={() => navigate('/company/reports/departments')}>View reports</Button>}
    />
  );
};

export default DepartmentsPage;
