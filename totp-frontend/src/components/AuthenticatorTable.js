import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Spinner } from 'react-bootstrap';
import { FaTrash, FaCopy, FaInbox } from 'react-icons/fa';
import CountdownCircle from './CountdownCircle';

const AuthenticatorTable = ({ authenticators, loading, onDelete, onCopy, serverTime, timeOffset, onCountdownZero }) => {
  const [countdown, setCountdown] = useState({});
  const [lastRemaining, setLastRemaining] = useState(null);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    // 初始化倒计时
    if (serverTime && authenticators.length > 0) {
      const newCountdown = {};
      authenticators.forEach(auth => {
        newCountdown[auth.id] = auth.remaining_time;
      });
      setCountdown(newCountdown);
      setHasTriggered(false); // 重置触发状态
    }
  }, [authenticators, serverTime]);

  useEffect(() => {
    // 初始化倒计时 - 移除这个useEffect，统一在定时器中处理
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      // 使用服务器时间（OTP时间）
      const currentTime = Math.floor(Date.now() / 1000) + (timeOffset || 0);
      const remaining = 30 - (currentTime % 30);
      
      setCountdown(prev => {
        const newCountdown = { ...prev };
        
        authenticators.forEach(auth => {
          newCountdown[auth.id] = remaining;
        });
        
        return newCountdown;
      });
      
      // 当倒计时为30秒（新周期开始）时触发刷新
      if (remaining === 30 && !hasTriggered && authenticators.length > 0) {
        console.log(`OTP时间新周期开始，触发刷新: ${new Date().toLocaleTimeString()}`);
        setHasTriggered(true);
        
        // 延迟200ms确保服务器已生成新验证码
        setTimeout(() => {
          console.log(`执行刷新: ${new Date().toLocaleTimeString()}`);
          onCountdownZero();
        }, 50);
      }
      
      // 重置触发状态
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