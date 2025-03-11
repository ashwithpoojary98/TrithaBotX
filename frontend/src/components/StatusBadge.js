const StatusBadge = ({ status, className = '' }) => {
    const getColorClasses = () => {
      switch (status.toLowerCase()) {
        case 'passed':
        case 'completed':
          return 'bg-green-100 text-green-800';
        case 'failed':
          return 'bg-red-100 text-red-800';
        case 'running':
          return 'bg-yellow-100 text-yellow-800';
        case 'skipped':
          return 'bg-gray-100 text-gray-800';
        default:
          return 'bg-blue-100 text-blue-800';
      }
    };
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getColorClasses()} ${className}`}>
        {status.toUpperCase()}
      </span>
    );
  };
  
  export default StatusBadge;