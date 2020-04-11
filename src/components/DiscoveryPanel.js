import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  Drawer,
  Form,
  Button,
  Col,
  Row,
  Input,
  Skeleton,
  Select,
  Modal,
  Switch,
} from "antd";
import { connect } from "dva";
import { schemeTableau10, range } from "d3";
import str2num from "../utils/str2num";

const { Option } = Select;

const Container = styled.div`
  position: relative;
  margin: 1em 0 2em 0;
`;

const An = styled.div`
  position: absolute;
  top: -56px;
`;

const MyRow = styled.div`
  display: flex;
`;

const Wrapper = styled.div`
  position: relative;
`;

const CardContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  background: white;
  padding: 20px;
  margin: 20px 0;
  width: 100%;
  height: 200px;
  cursor: pointer;
  transition: all 0.5s;
  &:hover {
    box-shadow: 0px 0px 10px 2px rgba(0, 0, 0, 0.1);
  }
`;

const VoteButton = styled(Button)``;

const ContentWrapper = styled.div`
  width: 100%;
  height: 160px;
  display: flex;
  justify-content: space-between;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${(props) => props.color || "black"};
  color: white;
  font-weight: bold;
  font-family: siyuan;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  line-height: 32px;

  @media (max-width: 700px) {
    display: none;
  }
`;

const Image = styled.div`
  height: 160px;
  background: black;
  width: 300px;
  border-radius: 8px;

  @media (max-width: 700px) {
    display: none;
  }
`;

const Main = styled.div`
  overflow: auto;
  width: 100%;
  padding-left: 20px;
`;

const Sub = styled.div`
  margin-bottom: 1em;
  font-size: 12px;

  & .top {
    display: inline-block;
    background: orange;
    text-align: center;
    color: white;
    width: 40px;
    border-radius: 2px;
  }

  & span {
    margin-right: 10px;
  }
`;

const Left = styled.div`
  width: 70%;
  display: flex;
  justify-content: space-between;

  @media (max-width: 700px) {
    width: 100%;
  }
`;

const Control = styled.div`
  display: flex;
  align-items: center;
  margin: 0.5em 0 1em 0;
`;

const Preview = styled.div`
  margin-left: 10px;
`;

const Tool = styled.div`
  position: absolute;
  bottom: 0px;
  left: 0px;
  margin: 0 0 0.5em 0.5em;
  display: flex;
  align-items: center;

  & > span {
    background: black;
    color: white;
    display: inline-block;
    text-align: center;
    color: white;
    width: 60px;
    border-radius: 2px;
  }
`;

const CardButton = styled(Button)`
  margin: 0 0.5em;
`;

const Card = connect(null, {
  deleteComment: (id) => ({ type: "comment/deleteComment", payload: { id } }),
  setTop: (id) => ({ type: "comment/setTop", payload: { id } }),
  setShow: (id) => ({ type: "comment/setShow", payload: { id } }),
  readMore: (id) => ({ type: "comment/readMore", payload: { id } }),
})(
  ({
    id,
    title,
    des,
    url,
    createTime,
    isAdmin,
    loading,
    author,
    isTop,
    isShow,
    deleteComment,
    reading,
    setTop,
    preview,
    setShow,
    readMore,
  }) => {
    const [showDelete, setShowDelete] = useState(false);
    const avatarColor = () =>
      schemeTableau10[str2num(author) % schemeTableau10.length];
    return (
      <Wrapper>
        <CardContainer
          onClick={() => {
            window.open(url);
            readMore(id);
          }}
        >
          {loading ? (
            <Skeleton avatar />
          ) : (
            <ContentWrapper>
              <Left>
                <Avatar color={avatarColor(author)}>
                  {author.slice(0, 1)}
                </Avatar>
                <Main>
                  <h2>{title}</h2>
                  <Sub>
                    {isTop === 1 && <span className="top">置顶</span>}
                    <span>作者：{author}</span>
                    <span>阅读：{reading}</span>
                    <span>日期：{createTime.toLocaleString()}</span>
                  </Sub>
                  <p>{des}</p>
                </Main>
              </Left>
              <Image />
            </ContentWrapper>
          )}
        </CardContainer>
        {isAdmin && !preview && (
          <>
            <Tool>
              {!isShow && <span>未发布</span>}
              <CardButton
                onClick={(e) => {
                  e.stopPropagation();
                  setShow(id);
                }}
              >
                {isShow ? "撤回" : "发布"}
              </CardButton>
              <CardButton
                onClick={(e) => {
                  e.stopPropagation();
                  setTop(id);
                }}
              >
                {isTop ? "取消置顶" : "置顶"}
              </CardButton>
              <CardButton
                onClick={(e) => {
                  setShowDelete(true);
                  e.stopPropagation();
                }}
              >
                删除
              </CardButton>
            </Tool>
            <Modal
              title="删除投稿"
              visible={showDelete}
              onOk={(e) => {
                e.stopPropagation();
                deleteComment(id);
                setShowDelete(false);
              }}
              onCancel={() => setShowDelete(false)}
              okText="确定"
              cancelText="删除"
            >
              <p>确定要删除？</p>
            </Modal>
          </>
        )}
      </Wrapper>
    );
  }
);

function CommentPanel({
  form,
  visible,
  setVisible,
  isAdmin,
  getData,
  data,
  loading,
  addComment,
}) {
  const { getFieldDecorator } = form;
  const [selectedType, setSelectedType] = useState("reading");
  const [selectedRange, setSelectedRange] = useState("all");
  const [preview, setPreview] = useState(false);
  const types = [
    { name: "最热", key: "reading" },
    { name: "最新", key: "time" },
  ];
  const ranges = [
    { name: "所有", key: "all" },
    { name: "自己", key: "self" },
  ];

  function handleSubmit(e) {
    e.preventDefault();
    form.validateFields((error, values) => {
      if (!error) {
        addComment(values);
      }
    });
    setVisible(false);
  }

  useEffect(() => {
    getData(selectedType);
  }, [selectedType, selectedRange]);

  return (
    <Container>
      <An id="story" />
      <h1>发现</h1>
      <MyRow>
        <p>
          这里你可以通过投稿提出问题，或者回答问题；也可以看别人提出的问题和回答的问题。
        </p>
        <VoteButton type="primary" onClick={() => setVisible(true)}>
          我要投稿
        </VoteButton>
      </MyRow>
      <Control>
        <div>
          <span>
            <b>范围</b>
          </span>
          &ensp;
          <Select value={selectedRange} onChange={setSelectedRange}>
            {ranges.map((d) => (
              <Option key={d.key}>{d.name}</Option>
            ))}
          </Select>
        </div>
        &emsp;
        <div>
          <span>
            <b>排序方式</b>
          </span>
          &ensp;
          <Select value={selectedType} onChange={setSelectedType}>
            {types.map((d) => (
              <Option key={d.key}>{d.name}</Option>
            ))}
          </Select>
        </div>
        {isAdmin && (
          <Preview>
            <span>
              <b>预览</b>
            </span>
            &ensp;
            <Switch onChange={() => setPreview(!preview)} checked={preview} />
          </Preview>
        )}
      </Control>
      {loading ? (
        range(1).map((d) => <Card key={d} loading={true} />)
      ) : !data || data.length === 0 ? (
        <h1>没有数据</h1>
      ) : (
        data
          .filter((d) => !preview || d.isShow)
          .sort((a, b) => {
            if (selectedType === "reading")
              return (
                a.isShow - b.isShow ||
                b.isTop - a.isTop ||
                b.reading - a.reading
              );
            else return b.createTime - a.createTime;
          })
          .map((d) => (
            <Card {...d} key={d.id} isAdmin={isAdmin} preview={preview} />
          ))
      )}
      <Drawer
        title="投稿"
        width={360}
        onClose={() => setVisible(false)}
        visible={visible}
        bodyStyle={{ paddingBottom: 80 }}
        style={{ zIndex: 1010 }}
      >
        <Form layout="vertical" hideRequiredMark>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="昵称">
                {getFieldDecorator("author", {
                  rules: [
                    { required: true, message: "请输入显示文章时候的昵称" },
                  ],
                })(<Input placeholder="请输入显示文章时候的昵称" />)}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="标题">
                {getFieldDecorator("title", {
                  rules: [{ required: true, message: "请输入文章的标题" }],
                })(<Input placeholder="请输入文章的标题" />)}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="文章链接">
                {getFieldDecorator("url", {
                  rules: [{ required: true, message: "请输入文章的链接" }],
                })(<Input placeholder="请输入文章的链接" />)}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="介绍">
                {getFieldDecorator("des", {
                  rules: [
                    {
                      required: true,
                      message: "请输入文章介绍",
                    },
                  ],
                })(
                  <Input.TextArea
                    rows={4}
                    placeholder="用一段简短的文字介绍一下文章吧"
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <div
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: "100%",
            borderTop: "1px solid #e9e9e9",
            padding: "10px 16px",
            background: "#fff",
            textAlign: "right",
          }}
        >
          <Button onClick={() => setVisible(false)} style={{ marginRight: 8 }}>
            取消
          </Button>
          <Button onClick={handleSubmit} type="primary">
            提交
          </Button>
        </div>
      </Drawer>
    </Container>
  );
}

export default connect(
  ({ comment, loading }) => ({
    visible: comment.openForm,
    isAdmin: comment.isAdmin,
    data: comment.data,
    pages: comment.pages,
    loading: loading.models.comment,
  }),
  {
    addComment: (options) => ({
      type: "comment/addComment",
      payload: options,
    }),
    setVisible: (value) => ({
      type: "comment/setOpenForm",
      payload: { value },
    }),
    getData: (index, type) => ({
      type: "comment/getData",
      payload: {
        index,
        type,
      },
    }),
  }
)(Form.create()(CommentPanel));
