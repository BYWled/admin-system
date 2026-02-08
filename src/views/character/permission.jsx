import { Button, Card, Empty, Flex, Typography } from "antd";
import s from '../../styles/layout.module.scss'

export default function permission() {
    return (
        <Card classNames={{ root: s.cardRoot, header: s.cardHeader, title: s.cardTitle }} variant="borderless" style={{ width: '100%', height: '75vh' }} >
            <Flex justify="center" align="center" style={{ width: '100%', height: 'calc(75vh - 40px)' }} >
                <Empty
                    description={
                        <>
                            <Typography.Text className={s.cardTitle} strong >🍵权限管理暂未开发~</Typography.Text><br />
                            <Button type="primary" style={{ marginTop: 16 }} onClick={() => window.open('https://github.com/BYWled/admin-system')} >去作者Github拷打他</Button>
                        </>
                    }
                />
            </Flex>
        </Card>
    )
}
