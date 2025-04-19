import { useEffect } from 'react';

interface DocumentTitleProps {
  title: string;
}

export const DocumentTitle: React.FC<DocumentTitleProps> = ({ title }) => {
  useEffect(() => {
    document.title = `${title} | The Online.Bar`;
  }, [title]);

  return null;
}; 