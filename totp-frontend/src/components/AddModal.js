import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const AddModal = ({ show, onHide, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    secret_key: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.secret_key) {
      alert('请填写所有必填字段');
      return;
    }
    onSave({
      ...formData,
      secret_key: formData.secret_key.trim().toUpperCase()
    });
    setFormData({ name: '', email: '', secret_key: '' });
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', secret_key: '' });
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>添加新验证器</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>名称 <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>邮箱 <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>密钥 <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="secret_key"
              value={formData.secret_key}
              onChange={handleChange}
              placeholder="例如: JBSWY3DPEHPK3PXP"
              required
            />
            <Form.Text className="text-muted">
              请输入Base32格式的TOTP密钥
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            取消
          </Button>
          <Button variant="primary" type="submit">
            保存
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddModal;