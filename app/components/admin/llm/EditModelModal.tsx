import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Switch } from 'antd';
import useModelListStore from '@/app/store/modelList';
import { LLMModel, LLMModelProvider } from '@/types/llm';
import { updateCustomModelInServer } from '@/app/admin/llm/actions';


type EditModelModalProps = {
  model?: LLMModel;
  isEditModelModalOpen: boolean;
  setIsEditModelModalOpen: (open: boolean) => void;
  provider: LLMModelProvider;
};

const EditModelModalProps: React.FC<EditModelModalProps> = ({
  model,
  isEditModelModalOpen,
  setIsEditModelModalOpen,
  provider,
}) => {
  const [customModelForm] = Form.useForm();
  useEffect(() => {
    if (model) {
      customModelForm.setFieldsValue({
        oldModelId: model.id,
        modelId: model.id,
        modelDisplayName: model.displayName,
        modelMaxTokens: typeof model?.maxTokens === 'number' ? model.maxTokens / 1024 : 32,
        modelVisionSupport: model.supportVision,
        modelToolSupport: model.supportTool,
      });
    }
  }, [model, customModelForm]);

  const { updateCustomModel } = useModelListStore();

  const onModelFormSubmit = async (values: {
    oldModelId: string;
    modelId: string;
    modelDisplayName: string;
    modelMaxTokens: number;
    modelVisionSupport: boolean;
    modelToolSupport: boolean;
  }) => {
    await updateCustomModel(values.oldModelId, {
      id: values.modelId,
      displayName: values.modelDisplayName,
      maxTokens: values.modelMaxTokens * 1024,
      supportVision: values.modelVisionSupport,
      supportTool: values.modelToolSupport,
      selected: true,
      type: 'custom',
      provider: {
        id: provider.id,
        apiStyle: provider.apiStyle,
        providerName: provider.providerName
      }
    });
  
    await updateCustomModelInServer(values.oldModelId, {
      displayName: values.modelDisplayName,
      maxTokens: values.modelMaxTokens * 1024,
      supportVision: values.modelVisionSupport,
      supportTool: values.modelToolSupport,
      selected: true,
      type: 'custom',
      name: values.modelId,
      providerId: provider.id,
      providerName: provider.providerName
    });

    customModelForm.resetFields();
    setIsEditModelModalOpen(false);
  };

  return (
    <Modal
      title="修改自定义模型"
      maskClosable={false}
      keyboard={false}
      centered={true}
      okText='保存'
      cancelText='取消'
      open={isEditModelModalOpen}
      onOk={() => customModelForm.submit()}
      onCancel={() => setIsEditModelModalOpen(false)}
    >
      <div className='mt-4'>
        <Form
          layout="vertical"
          form={customModelForm}
          onFinish={onModelFormSubmit}
        >
          <Form.Item
            name='oldModelId'
            hidden={true}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name='modelId'
            label={<span className='font-medium'>模型 ID</span>}
            rules={[{ required: true, message: '请输入模型 ID' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name='modelDisplayName'
            label={<span className='font-medium'>模型显示名称</span>}
            rules={[{ required: true, message: '请输入模型显示名称' }]}
          >
            <Input type='text' />
          </Form.Item>
          <Form.Item
            name='modelMaxTokens'
            label={<span className='font-medium'>最大 Token 数</span>}
            rules={[{ required: true, message: '请选择最大 Token 数' }]}
          >
            <InputNumber addonAfter="K" />
          </Form.Item>
          <Form.Item
            name='modelVisionSupport'
            valuePropName="checked"
            label={<span className='font-medium'>支持视觉识别</span>}
          >
            <Switch defaultChecked={false} />
          </Form.Item>
          <Form.Item
            name='modelToolSupport'
            valuePropName="checked"
            label={<span className='font-medium'>支持工具调用</span>}
          >
            <Switch defaultChecked={false} />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default EditModelModalProps;