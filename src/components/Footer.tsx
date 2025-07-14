import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-16 py-8 border-t border-slate-700/20">
      <div className="px-12">
        <div className="flex items-center justify-between">
          {/* Copyright - Left Side */}
          <div className="text-slate-500 text-sm">
            © 2024 Me dá um Exemplo. Todos os direitos reservados.
          </div>
          
          {/* Agency Credit - Right Side */}
          <div className="text-slate-500 text-sm">
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