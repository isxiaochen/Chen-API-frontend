import Footer from '@/components/Footer';
import {ArrowRightOutlined, LockOutlined, MobileOutlined, SmileOutlined, UserOutlined} from '@ant-design/icons';
import { LoginForm, ProFormCaptcha, ProFormText } from '@ant-design/pro-components';
import {Alert, Input, message, Tabs} from 'antd';
import React, { useState } from 'react';
import styles from './index.less';
import { history, Link } from '@@/exports';
import {
  getCaptchaUsingGET,
  smsCaptchaUsingGET, userEmailRegisterUsingPOST, userLoginBySmsUsingPOST,
  userLoginUsingPOST,
  userRegisterUsingPOST
} from '@/api/binapi-backend/userController';
import { randomStr } from '@antfu/utils';

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const Register: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<any>(null);

  React.useEffect(async () => {
    await getCaptcha();
    return () => {
      //return出来的函数本来就是更新前，销毁前执行的函数，现在不监听任何状态，所以只在销毁前执行
    };
  }, []); //第二个参数一定是一个空数组，因为如果不写会默认监听所有状态，这样写就不会监听任何状态，只在初始化时执行一次。

  /**
   * 获取图形验证码
   */
  const getCaptcha = async () => {
    let randomString;
    const temp = localStorage.getItem('api-open-platform-randomString');
    if (temp) {
      randomString = temp;
    } else {
      randomString = randomStr(
        32,
        '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      );
      localStorage.setItem('api-open-platform-randomString', randomString);
    }
    //携带浏览器请求标识
    const res = await getCaptchaUsingGET({
      headers: {
        signature: randomString,
      },
      responseType: 'blob', //必须指定为'blob'
    });
    let url = window.URL.createObjectURL(res);
    setImageUrl(url);
  };

  const handleSubmit = async (values: API.UserRegisterRequest) => {
    const { userPassword, checkPassword } = values;
    console.log(values)
    if (userPassword !== checkPassword) {
      message.error('两次输入密码不一致');
      return;
    }
    try {
      const signature = localStorage.getItem("api-open-platform-randomString")
      // 注册
      let res;
      if (type === 'register') {
        // 登录
        res = await userRegisterUsingPOST(values,{
          headers: {
            "signature": signature
          },
        });
      } else {
        res = await userEmailRegisterUsingPOST({
          ...values,
        });
      }
      console.log(res)
      if (res.data) {
        const defaultLoginSuccessMessage = '注册成功！';
        message.success(defaultLoginSuccessMessage);
        /** 此方法会跳转到 redirect 参数所在的位置 */

        if (!history) return;
        history.push('/user/login');
        return;
      }
    } catch (error: any) {
      console.log(error);
      message.error(error.message);
    }
  };
  const [userRegisterState, setUserRegisterState] = useState<API.RegisterResult>({});
  const { status, type: registerState } = userRegisterState;

  const [type, setType] = useState<string>('register');

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <LoginForm
          submitter={{
            searchConfig: {
              submitText: '注册',
            },
          }}
          logo={<img alt="logo" src="/logo.svg" />}
          title="Chen API"
          subTitle={
            <>
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              <p>
                <b>一个丰富的API开放调用平台</b>
              </p>
            </>
          }
          onFinish={async (values) => {
            await handleSubmit(values as API.UserRegisterRequest);
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'register',
                label: '账号密码注册',
              },
              {
                key: 'emailRegister',
                label: 'QQ邮箱注册',
              },
            ]}
          />
          {status === 'error' && registerState === 'register' && (
            <LoginMessage content={'错误的用户名和密码(admin/ant.design)'} />
          )}
          {type === 'register' &&
            <>
              {/*<ProFormText*/}
              {/*  name="userName"*/}
              {/*  fieldProps={{*/}
              {/*    size: 'large',*/}
              {/*    prefix: <SmileOutlined className={styles.prefixIcon}/>*/}
              {/*  }}*/}
              {/*  placeholder={'昵称：昵称小于7个字'}*/}
              {/*  rules={[*/}
              {/*    {*/}
              {/*      required: true,*/}
              {/*      message: '昵称是必填项！',*/}
              {/*    },*/}
              {/*  ]}*/}
              {/*/>*/}
              <ProFormText
                name="userAccount"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined className={styles.prefixIcon} />,
                }}
                placeholder={'账号：账号应大于3个字小于16个字'}
                rules={[
                  {
                    required: true,
                    pattern:/^.{3,16}$/,
                    message: '账号必须大于3个字符并且小于16个字符！',
                  },
                ]}
              />
              <ProFormText.Password
                name="userPassword"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={styles.prefixIcon} />,
                }}
                placeholder={'密码: 至少3位'}
                rules={[
                  {
                    required: true,
                    pattern:/^.{3,16}$/,
                    message: '密码必须大于3个字符且小于16个字符！',
                  },
                ]}
              />
              <ProFormText.Password
                name="checkPassword"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={styles.prefixIcon} />,
                }}
                placeholder={'确认密码'}
                rules={[
                  {
                    required: true,
                    pattern:/^.{3,16}$/,
                    message: '两次密码必须一致！',
                  },
                ]}
              />
              {/*<ProFormText*/}
              {/*  fieldProps={{*/}
              {/*    size: 'large',*/}
              {/*    prefix: <MobileOutlined className={'prefixIcon'} />,*/}
              {/*  }}*/}
              {/*  name="phoneNum"*/}
              {/*  placeholder={'手机号'}*/}
              {/*  rules={[*/}
              {/*    {*/}
              {/*      required: true,*/}
              {/*      message: '请输入手机号！',*/}
              {/*    },*/}
              {/*    {*/}
              {/*      pattern: /^1[3-9]\d{9}$/,*/}
              {/*      message: '手机号格式错误！',*/}
              {/*    },*/}
              {/*  ]}*/}
              {/*/>*/}

              {/*<ProFormCaptcha*/}
              {/*  fieldProps={{*/}
              {/*    size: 'large',*/}
              {/*    prefix: <LockOutlined className={'prefixIcon'} />,*/}
              {/*  }}*/}
              {/*  captchaProps={{*/}
              {/*    size: 'large',*/}
              {/*  }}*/}
              {/*  placeholder={'请输入验证码'}*/}
              {/*  captchaTextRender={(timing, count) => {*/}
              {/*    if (timing) {*/}
              {/*      return `${count} ${'后重新获取'}`;*/}
              {/*    }*/}
              {/*    return '获取验证码';*/}
              {/*  }}*/}
              {/*  name="phoneCaptcha"*/}
              {/*  // 手机号的 name，onGetCaptcha 会注入这个值*/}
              {/*  phoneName="phoneNum"*/}
              {/*  rules={[*/}
              {/*    {*/}
              {/*      required: true,*/}
              {/*      message: '请输入验证码！',*/}
              {/*    },*/}
              {/*    {*/}
              {/*      pattern: /^[0-9]\d{4}$/,*/}
              {/*      message: '验证码格式错误！',*/}
              {/*    },*/}
              {/*  ]}*/}
              {/*  onGetCaptcha={async (phoneNum) => {*/}
              {/*    //获取验证成功后才会进行倒计时*/}
              {/*    try {*/}
              {/*      const result = await smsCaptchaUsingGET({*/}
              {/*        phoneNum,*/}
              {/*      });*/}
              {/*      if (!result) {*/}
              {/*        return;*/}
              {/*      }*/}
              {/*      message.success(result.data);*/}
              {/*    }catch (e) {*/}
              {/*    }*/}
              {/*  }}*/}
              {/*/>*/}

              <div style={{ display: 'flex' }}>
                <ProFormText
                  fieldProps={{
                    autoComplete:"off",
                    size: 'large',
                    prefix: <ArrowRightOutlined className={'prefixIcon'} />,
                  }}
                  name="captcha"
                  placeholder={'请输入右侧验证码'}
                  rules={[
                    {
                      required: true,
                      message: '请输入图形验证码！',
                    },
                    {
                      pattern: /^[0-9]\d{3}$/,
                      message: '验证码格式错误！',
                    },
                  ]}
                />
                <img
                  src={imageUrl}
                  onClick={getCaptcha}
                  style={{ marginLeft: 18 }}
                  width="100px"
                  height="39px"
                />
              </div>
            </>
          }

          {status === 'error' && registerState === 'emailRegister' && <LoginMessage content="验证码错误" />}
          {type === 'emailRegister' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MobileOutlined className={styles.prefixIcon} />,
                }}
                name="emailNum"
                placeholder={'请输入QQ邮箱！'}
                rules={[
                  {
                    required: true,
                    message: '邮箱是必填项！',
                  },
                  {
                    // pattern: /^1\d{10}$/,    手机号码正则表达式
                    pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
                    message: '不合法的邮箱！',
                  },
                ]}
              />
              <ProFormCaptcha
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={styles.prefixIcon} />,
                }}
                captchaProps={{
                  size: 'large',
                }}
                placeholder={'请输入验证码！'}
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count} ${'秒后重新获取'}`;
                  }
                  return '获取验证码';
                }}
                name="emailCaptcha"
                phoneName="emailNum"
                rules={[
                  {
                    required: true,
                    message: '验证码是必填项！',
                  },
                ]}
                onGetCaptcha={async (emailNum) => {
                  const captchaType:string = 'register';
                  const result = await smsCaptchaUsingGET({
                    emailNum,
                    captchaType,
                  });
                  if (result === false) {
                    return;
                  }
                  message.success(result.data);
                }}
              />
            </>
          )}

          <div
            style={{
              marginBottom: 24,
            }}
          >
            <Link
              style={{
                marginBottom: 24,
                float: 'right'
              }}
              to={'/user/login'}
            >
              已有帐号，去登陆！
            </Link>
          </div>

        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};
export default Register;
