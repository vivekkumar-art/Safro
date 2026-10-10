import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NielCommandCenter } from '../niel/NielCommandCenter';

export const NielCommandPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.location.pathname.startsWith('/admin')) {
      navigate('/admin/dashboard');
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020617] overflow-hidden">
      <NielCommandCenter onBack={handleBack} standalone />
    </div>
  );
};

export default NielCommandPage;
