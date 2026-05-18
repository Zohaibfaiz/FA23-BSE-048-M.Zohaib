import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Activity, User, FileText, Database } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action.toLowerCase()) {
      case 'login':
      case 'register':
        return <User className="w-4 h-4" />;
      case 'create':
      case 'update':
      case 'delete':
        return <FileText className="w-4 h-4" />;
      case 'vote':
        return <Database className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActionColor = (action) => {
    switch (action.toLowerCase()) {
      case 'login': return 'text-successGreen bg-successGreen/10 border-successGreen/20';
      case 'vote': return 'text-primaryGold bg-primaryGold/10 border-primaryGold/20';
      case 'delete': return 'text-dangerRed bg-dangerRed/10 border-dangerRed/20';
      default: return 'text-textPrimary bg-secondaryBg border-borderColor';
    }
  };

  const filteredLogs = logs.filter(l => 
    l.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.entity_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-textPrimary">Audit Logs</h1>
          <p className="text-textSecondary">System-wide activity monitor</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-borderColor flex justify-between items-center">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-textMuted" />
            </div>
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondaryBg text-textSecondary">
              <tr>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">Entity Type</th>
                <th className="px-6 py-4 font-medium">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderColor">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-textSecondary">Loading logs...</td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-secondaryBg/50 transition-colors">
                    <td className="px-6 py-4 text-textSecondary">
                      {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-textPrimary">{log.profiles?.full_name || 'System Action'}</div>
                      <div className="text-xs text-textSecondary">{log.profiles?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1 ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)}
                        {log.action.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-textPrimary font-medium">
                      {log.entity_type}
                    </td>
                    <td className="px-6 py-4 text-textSecondary font-mono text-xs">
                      {log.ip_address || 'Unknown'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-textSecondary">No logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
