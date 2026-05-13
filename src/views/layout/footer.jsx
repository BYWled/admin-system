import { Layout, Flex, Button } from "antd";
import s from '../../styles/layout.module.scss'

export default function Footer({ darkMode }) {
    return (
        <Layout.Footer className={s.layoutFooter}>
            <Flex justify='center' align='center' style={{ width: '100%', height: '100%' }}>
                {/* TODO:_blank 新增标签页打开 */}
                <Button color={darkMode ? "geekblue" : "default"} styles={{
                    root: {
                        height: '100%',
                        padding: 0,
                    }
                }}
                    onClick={() => window.open('https://github.com/BYWled/admin-system', '_blank')}
                    variant="link">admin-system Dev-03.26</Button>
                <span>&nbsp;©2026 Created by&nbsp;</span>
                <Button color={darkMode ? "geekblue" : "default"} styles={{
                    root: {
                        height: '100%',
                        padding: 0,
                    }
                }}
                    onClick={() => window.open('https://github.com/BYWled', '_blank')}
                    variant="link">BYWled</Button>
            </Flex>
        </Layout.Footer>
    );
}