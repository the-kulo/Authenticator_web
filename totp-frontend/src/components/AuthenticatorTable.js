import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Spinner } from 'react-bootstrap';
import { FaTrash, FaCopy, FaInbox } from 'react-icons/fa';
import CountdownCircle from './CountdownCircle';

const AuthenticatorTable = ({ authenticators, loading, onDelete, onCopy, serverTime }) => {
  const [countdown, setCountdown] = useState({});

  useEffect(() => {
    // 初始化倒计时，基于服务器时间
    if (serverTime && authenticators.length > 0) {
      const newCountdown = {};
      authenticators.forEach(auth => {
        newCountdown[auth.id] = auth.remaining_time;
      });
      setCountdown(newCountdown);
    }
  }, [authenticators, serverTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        const newCountdown = { ...prev };
        const currentTime = Math.floor(Date.now() / 1000);
        
        authenticators.forEach(auth => {
          // 基于当前时间重新计算剩余时间，而不是简单减1
          const remaining = 30 - (currentTime % 30);
          newCountdown[auth.id] = remaining;
        });
        return newCountdown;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [authenticators]);

  const copyToClipboard = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      onCopy('验证码已复制到剪贴板', 'success');
    } catch (error) {
      onCopy('复制失败', 'warning');
    }
  };

  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <div className="mt-2">正在加载验证码...</div>
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
                      className="totp-code"
                      onClick={() => copyToClipboard(auth.totp_code)}
                      style={{
                        fontFamily: 'Courier New, monospace',
                        fontSize: '1.2em',
                        fontWeight: 'bold',
                        letterSpacing: '2px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
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