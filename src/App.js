
import React, { useState } from 'react';
import { Select, Form, Button, Modal, Upload, Tooltip, notification } from 'antd';
import axios from "axios"
import './App.css';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
import { MinusCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
const { Option } = Select;

const defaultCombinations = {
  "CC": "coordinating conjunction",
  "CD": "cardinal digit",
  "DT": "determiner",
  "EX": "existential there",
  "FW": "foreign word",
  "IN": "preposition/subordinating conjunction",
  "JJ": "This NLTK POS Tag is an adjective (large)",
  "JJR": "adjective, comparative (larger)",
  "JJS": "adjective, superlative (largest)",
  "LS": "list market",
  "MD": "modal (could, will)",
  "NN": "noun, singular (cat, tree)",
  "NNS": "noun plural (desks)",
  "NNP": "proper noun, singular (sarah)",
  "NNPS": "proper noun, plural (indians or americans)",
  "PDT": "predeterminer (all, both, half)",
  "POS": "possessive ending (parent\\ 's)",
  "PRP": "personal pronoun (hers, herself, him,himself)",
  "PRP$": "possessive pronoun (her, his, mine, my, our )",
  "RB": "adverb (occasionally, swiftly)",
  "RBR": "adverb, comparative (greater)",
  "RBS": "adverb, superlative (biggest)",
  "RP": "particle (about)",
  "TO": "infinite marker (to)",
  "UH": "interjection(goodbye)",
  "VB": "verb(ask)",
  "VBG": "verb gerund(judging)",
  "VBD": "verb past tense(pleaded)",
  "VBN": "verb past participle(reunified)",
  "VBP": "verb, present tense not 3rd person singular(wrap)",
  "VBZ": "verb, present tense with 3rd person singular(bases)",
  "WDT": "wh-determiner(that, what)",
  "WP": "wh - pronoun(who)",
  "WRB": "wh - adverb(how)"
}

const defaultCombinationsJSX = [];
for (const item in defaultCombinations) {
  defaultCombinationsJSX.push(<Option key={item}>{item}</Option>);
}

function App() {
  const [result, setResult] = useState([]);
  const [file, setFile] = useState();
  const [uploading, setUploading] = useState(false);

  const props = {
    onRemove: file => {
      setFile();
    },
    beforeUpload: file => {
      setFile(file)
      return false;
    },
    file,
  };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalResultVisible, setIsModalResultVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleOkResult = () => {
    setIsModalResultVisible(false)
  }
  const [form] = Form.useForm();
  const onFinish = async values => {
    setUploading(true);
    const fmData = new FormData();
    const config = {
      headers: { "content-type": "multipart/form-data" }
    };
    fmData.append("file", file);
    for (let i = 0; i < values.combinations.length; i++) {
      fmData.append(`filters_${i}`, values.combinations[i])
    }
    try {
      const res = await axios.post(
        process.env.REACT_APP_BACKEND_URL + "/analyze",
        fmData,
        config
      );
      setUploading(false);
      setResult(res.data.message);
      setIsModalResultVisible(true);
    } catch (err) {
      setUploading(false);

      console.log("Error: ", err.response);
      notification.error({
        message: `${err.response.data.message}`,
      })
    }
  }
  const handleChange = () => {
    form.setFieldsValue({ defaultCombinations: [] });
  }
  const [size, setSize] = React.useState('default');
  return (
    <Form form={form} name="dynamic_form_nest_item" onFinish={onFinish} autoComplete="off" className="main-block">
      <Upload {...props} >
        <Button icon={<UploadOutlined />}>Select File</Button>
      </Upload>
      <Form.List className="combinations" name="combinations">
        {(fields, { add, remove }, { errors }) => (
          <>
            {fields.map((field, index) => (

              <Form.Item
                key={field.key}
              > <Form.Item
                {...field}
                noStyle
              >
                  <Select
                    mode="tags"
                    size={size}
                    placeholder="Please select"
                    onChange={handleChange}
                    style={{ width: '15%', marginRight: '2%' }}
                  >
                    {defaultCombinationsJSX}
                  </Select>
                </Form.Item>
                {fields.length > 1 ? (
                  <MinusCircleOutlined
                    className="dynamic-delete-button"
                    onClick={() => remove(field.name)}
                  />
                ) : null}
              </Form.Item>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                style={{ width: '60%' }}
                icon={<PlusOutlined />}
              >
                Add combination
              </Button>
              <Form.ErrorList errors={errors} />
            </Form.Item>
          </>
        )}
      </Form.List>

      <Form.Item>
        <Button type="primary" onClick={showModal} className="instructions-btn">
          Instructions
  </Button>
        <Modal title="Instructions" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} >
          {Object.keys(defaultCombinations).map((item) =>
            <div style={{ "display": "flex", "justifyContent": "space-between" }}>
              <p>{item}</p>
              <p>{defaultCombinations[item]}</p>
            </div>
          )}

        </Modal>

        <Modal title="Match" visible={isModalResultVisible} onOk={handleOkResult} >
          {result.map((combination) =>
            <>
              <Tooltip title={combination[1]}>
                <span>{combination[0]}</span>
              </Tooltip>
              <br />
            </>
          )}

        </Modal>

        <Button type="primary" htmlType="submit" disabled={!file}
          loading={uploading}>
          Analyze
        </Button>
      </Form.Item>

    </Form >

  );
}

export default App;
