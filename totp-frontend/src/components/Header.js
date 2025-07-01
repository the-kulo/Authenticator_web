import React from 'react';
import { Row, Col, Button, Badge } from 'react-bootstrap';
import { FaShieldAlt, FaPlus, FaSync } from 'react-icons/fa';

const Header = ({ onAddClick, onRefresh, totalCount }) => {
  return (
    <Row className="mb-4">
      <Col>
        <div className="d-flex justify-content-between align-items-center">
          <h1 className="text-primary">
            <FaShieldAlt className="me-2" />
            TOTP 验证码管理器
          </h1>
          <div className="d-flex align-items-center">
            <Button 
              variant="secondary" 
              className="me-2 header-btn"
              disabled
            >
              总计: {totalCount}
            </Button>
            <Button 
              variant="outline-primary" 
              className="me-2 header-btn"
              onClick={onRefresh}
            >
              <FaSync className="me-1" /> 刷新
            </Button>
            <Button 
              variant="primary" 
              className="header-btn"
              onClick={onAddClick}
            >
              <FaPlus className="me-1" /> 添加验证器
            </Button>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default Header;