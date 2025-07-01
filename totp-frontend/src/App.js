import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import Header from './components/Header';
import AuthenticatorTable from './components/AuthenticatorTable';
import AddModal from './components/AddModal';
import api from './services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [authenticators, setAuthenticators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'info' });
  const [serverTime, setServerTime] = useState(null);
  const [timeOffset, setTimeOffset] = useState(0);

  useEffect(() => {
    loadAuthenticators();
    syncTime(); // 初始时间同步
    
    // 只保留时间同步的定时器，移除数据刷新定时器
    const timeInterval = setInterval(syncTime, 30000);
    
    return () => {
      clearInterval(timeInterval);
    };
  }, []);

  const syncTime = async () => {
    try {
      const timeData = await api.getServerTime();
      const localTime = Math.floor(Date.now() / 1000);
      setTimeOffset(timeData.server_time - localTime);
    } catch (error) {
      console.warn('时间同步失败:', error.message);
    }
  };

  const loadAuthenticators = async () => {
    try {
      setLoading(true);
      const response = await api.getAuthenticators();
      setAuthenticators(response.data);
      setServerTime(response.server_time);
    } catch (error) {
      showAlert('加载失败: ' + error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  // 新增：当倒计时到零时触发的回调函数
  const handleCountdownZero = () => {
    console.log('倒计时到零，刷新验证码');
    loadAuthenticators();
  };

  const showAlert = (message, variant = 'info') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'info' }), 3000);
  };

  const handleAdd = async (data) => {
    try {
      await api.addAuthenticator(data);
      showAlert('添加成功', 'success');
      setShowModal(false);
      loadAuthenticators();
    } catch (error) {
      showAlert('添加失败: ' + error.message, 'danger');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个验证器吗？')) return;
    
    try {
      await api.deleteAuthenticator(id);
      showAlert('删除成功', 'success');
      loadAuthenticators();
    } catch (error) {
      showAlert('删除失败: ' + error.message, 'danger');
    }
  };

  return (
    <div className="App">
      <Container className="mt-4">
        <Row>
          <Col>
            <Header 
              onAddClick={() => setShowModal(true)}
              onRefresh={loadAuthenticators}
              totalCount={authenticators.length}
            />
            
            {alert.show && (
              <Alert variant={alert.variant} className="mt-3">
                {alert.message}
              </Alert>
            )}
            
            <AuthenticatorTable 
              authenticators={authenticators}
              loading={loading}
              onDelete={handleDelete}
              onCopy={showAlert}
              serverTime={serverTime}
              timeOffset={timeOffset}
              onCountdownZero={handleCountdownZero}
            />
            
            <AddModal 
              show={showModal}
              onHide={() => setShowModal(false)}
              onSave={handleAdd}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
