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

  useEffect(() => {
    loadAuthenticators();
    // 减少刷新间隔到10秒，提高同步精度
    const interval = setInterval(loadAuthenticators, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadAuthenticators = async () => {
    try {
      setLoading(true);
      const response = await api.getAuthenticators();
      setAuthenticators(response.data);
      setServerTime(response.server_time); // 保存服务器时间
    } catch (error) {
      showAlert('加载失败: ' + error.message, 'danger');
    } finally {
      setLoading(false);
    }
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
