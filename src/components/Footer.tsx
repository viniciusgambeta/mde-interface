import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="mt-16 py-8 border-t border-slate-700/20">
      <div className="px-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Copyright - Left Side */}
          <div className="text-slate-500 text-sm text-center lg:text-left">
            © 2024 Me dá um Exemplo. Todos os direitos reservados.
            <button
              onClick={() => navigate('/privacidade')}
              className="text-[#ff7551] hover:text-[#ff7551]/80 transition-colors ml-2"
            >
              Política de Privacidade
            </button>
          </div>
          
          {/* Agency Credit - Right Side */}
          <div className="text-slate-500 text-sm text-center lg:text-right">
            O Me dá um Exemplo é um projeto{' '}
            <a 
              href="https://instagram.com/agenciadebolso__" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#ff7551] hover:text-[#ff7551]/80 transition-colors"
            >
              @agenciadebolso_
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;