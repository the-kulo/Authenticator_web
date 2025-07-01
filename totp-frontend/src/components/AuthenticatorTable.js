import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Spinner } from 'react-bootstrap';
import { FaTrash, FaCopy, FaInbox } from 'react-icons/fa';
import CountdownCircle from './CountdownCircle';

const AuthenticatorTable = ({ authenticators, loading, onDelete, onCopy, serverTime, timeOffset, onCountdownZero }) => {
  const [countdown, setCountdown] = useState({});
  const [hasTriggered, setHasTriggered] = useState(false);
  const [isAutoUpdating, setIsAutoUpdating] = useState(false); // 标记自动更新状态

  useEffect(() => {
    if (serverTime && authenticators.length > 0) {
      const newCountdown = {};
      authenticators.forEach(auth => {
        newCountdown[auth.id] = auth.remaining_time;
      });
      setCountdown(newCountdown);
      setHasTriggered(false);
      setIsAutoUpdating(false);
    }
  }, [authenticators, serverTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000) + (timeOffset || 0);
      const remaining = 30 - (currentTime % 30);
      
      setCountdown(prev => {
        const newCountdown = { ...prev };
        authenticators.forEach(auth => {
          newCountdown[auth.id] = remaining;
        });
        return newCountdown;
      });
      
      // 自动刷新逻辑
      if (remaining === 30 && !hasTriggered && authenticators.length > 0) {
        console.log(`自动刷新开始: ${new Date().toLocaleTimeString()}`);
        setHasTriggered(true);
        setIsAutoUpdating(true);
        
        setTimeout(() => {
          onCountdownZero();
          // 延迟重置更新状态，给用户视觉反馈
          setTimeout(() => setIsAutoUpdating(false), 800);
        }, 50);
      }
      
      if (remaining < 28 && hasTriggered) {
        setHasTriggered(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [authenticators, timeOffset, onCountdownZero, hasTriggered]);

  const copyToClipboard = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      onCopy('验证码已复制到剪贴板', 'success');
    } catch (error) {
      onCopy('复制失败', 'warning');
    }
  };

  // 手动刷新时显示loading
  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <div className="mt-2">正在刷新验证码...</div>
        </Card.Body>
      </Card>
    );
  }

  if (authenticators.length === 0) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <FaInbox size={48} className="text-muted mb-3" />
          <div className="text-muted">暂无验证器，点击上方按钮添加</div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Body className="p-0">
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <Table hover className="mb-0">
            <thead className="table-light sticky-top">
              <tr>
                <th width="20%" className="text-center">名称</th>
                <th width="25%" className="text-center">邮箱</th>
                <th width="20%" className="text-center">验证码</th>
                <th width="15%" className="text-center">倒计时</th>
                <th width="20%" className="text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {authenticators.map(auth => (
                <tr key={auth.id}>
                  <td className="text-center align-middle">
                    <div className="fw-bold">{auth.name}</div>
                  </td>
                  <td className="text-center align-middle">
                    <div className="text-muted">{auth.email}</div>
                  </td>
                  <td className="text-center align-middle">
                    <span 
                      className={`totp-code ${isAutoUpdating ? 'auto-updating' : ''}`}
                      onClick={() => copyToClipboard(auth.totp_code)}
                      style={{
                        fontFamily: 'Courier New, monospace',
                        fontSize: '1.2em',
                        fontWeight: 'bold',
                        letterSpacing: '2px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      title="点击复制"
                    >
                      {auth.totp_code}
                    </span>
                  </td>
                  <td className="text-center align-middle">
                    <CountdownCircle 
                      remaining={countdown[auth.id] || auth.remaining_time}
                    />
                  </td>
                  <td className="text-center align-middle">
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => onDelete(auth.id)}
                    >
                      <FaTrash className="me-1" /> 删除
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AuthenticatorTable;