import { useState, useMemo, useEffect, useRef } from "react";
import { Card, Group, SimpleGrid, Text, ScrollArea, Progress, Box, Flex, Space, Accordion, TextInput, Center, Pagination } from "@mantine/core";
import { IconAlertTriangle, IconClock, IconCube } from "@tabler/icons-react";
import SkillsDonutChart from "../components/skillsDonut"; // Assuming this is your chart component

const SkillRequirementAnalyticsNew = ({ skillAnalysisData } : any) => {
    const [opened, setOpened] = useState<any>([]); 
    const [findingsOpened, setFindingsOpened] = useState<any>([]);
     // Track previous data to detect refreshes
    // const [prevData, setPrevData] = useState(skillAnalysisData);
    // Function to handle accordion toggle
    const handleAccordionChangeTasks = (value:any) => {
        setOpened((prevOpened : any) => {
            if (prevOpened.includes(value)) {
                return prevOpened.filter((item : any) => item !== value); // Close the accordion
            } else {
                return [...prevOpened, value]; // Open the accordion
            }
        });
    };

     
     // Track previous data to detect refreshes
    // const [findingsprevData, setFindingsPrevData] = useState(skillAnalysisData);
    // Function to handle accordion toggle
    const handleAccordionChangeFindings = (value:any) => {
        setFindingsOpened((prevOpened : any) => {
            if (prevOpened.includes(value)) {
                return prevOpened.filter((item : any) => item !== value); // Close the accordion
            } else {
                return [...prevOpened, value]; // Open the accordion
            }
        });
    };

    // const totalTaskSkills = skillAnalysisData?.skillAnalysis?.tasks?.reduce((acc : any, task :any) => acc + task?.skills?.length, 0);
    // const totalFindingSkills = skillAnalysisData?.skillAnalysis?.findings?.reduce((acc : any, finding : any) => acc + finding?.skills?.length, 0);

    const calculateTotalAvgTime = (items : any) => {
        return items?.reduce((total : any, item : any) => {
            return total + item?.skills?.reduce((sum : any, skill : any) => sum + skill?.manHours?.avg, 0);
        }, 0);
    };

    const totalAvgTimeTasks = Math.round(calculateTotalAvgTime(skillAnalysisData?.skillAnalysis?.tasks) || 0);
    const totalAvgTimeFindings = Math.round(calculateTotalAvgTime(skillAnalysisData?.skillAnalysis?.findings) || 0);

    // const [donutData, setDonutData] = useState([]);

    useEffect(()=>{
        processDonutData(skillAnalysisData);
    },[skillAnalysisData])

    const processDonutData = (data : any) => {
        const chartData : any = [];

        // Iterate through tasks to gather skills and their average man-hours
        data?.tasks?.forEach((task : any) => {
            task?.skills?.forEach((skill : any) => {
                if (skill?.skill) {
                    const avgManHours = skill?.manHours?.avg || 0;
                    chartData.push({
                        name: `${skill?.skill}`,
                        value: avgManHours,
                    });
                }
            });
        });

        // Add findings to the chart data
        data?.findings?.forEach((finding : any) => {
            finding?.skills?.forEach((skill : any) => {
                if (skill?.skill) {
                    const avgManHours = skill?.manHours?.avg || 0;
                    chartData.push({
                        name: `Finding - ${skill?.skill}`,
                        value: avgManHours,
                    });
                }
            });
        });

        // setDonutData(chartData);
    };

    const TaskAccordion = ({ data }: any) => {
        const [taskSearch, setTaskSearch] = useState("");
        const [currentPage, setCurrentPage] = useState(1);
        const itemsPerPage = 6;
    
        const filteredTasks = data?.filter((task: any) =>
            task.taskId.toLowerCase().includes(taskSearch.toLowerCase())
        );
    
        // Pagination logic
        const totalPages = Math.ceil(filteredTasks?.length / itemsPerPage);
        const paginatedTasks = filteredTasks?.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
    
        return (
            <>
            <Card withBorder h="85vh" shadow="sm" p="md" radius="md">
                {/* Top Section: Heading & Search Input */}
            <Box mb="md">
              <Text fw={600} size="lg" mb="sm">
                Tasks
              </Text>
              <TextInput
                    placeholder="Search Tasks by Task ID"
                    mb="sm"
                    value={taskSearch}
                    onChange={(event) => {
                        setTaskSearch(event.currentTarget.value);
                        setCurrentPage(1); // Reset pagination on search
                    }}
                />
            </Box>

            {/* Middle Section: Scrollable Accordion List */}
            <ScrollArea h="65vh" scrollbarSize={0}>
            {
                    paginatedTasks?.length > 0 ? (
                        <Accordion variant="separated">
                    {paginatedTasks?.map((task: any) => (
                        <Accordion.Item key={task.taskId} value={task.taskId}>
                            <Accordion.Control
                            // onClick={()=>handleAccordionChangeTasks(task.taskId)}
                            >
                                <Group>
                                    <IconCube color="#4E66DE" />
                                    {task.taskId}
                                </Group>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <ScrollArea h={400} scrollHideDelay={0}>
                                    <Box p="md">
                                        <SkillsDonutChart task={task} />
                                        {task?.skills?.map((skill: any) => (
                                            <Card key={skill.skill} shadow="0" p="sm" radius='md' mt="xs" bg='#f0f0f0'>
                                                <Text size="sm" fw={500}>{skill.skill}</Text>
                                                <Group justify="space-between">
                                                    <Text fz="xs" c="green" fw={700}>Min {skill?.manHours.min} Hr</Text>
                                                    <Text fz="xs" c="yellow" fw={700}>Avg {skill?.manHours.avg} Hr</Text>
                                                    <Text fz="xs" c="red" fw={700}>Max {skill?.manHours.max} Hr</Text>
                                                </Group>
                                                <Progress.Root>
                                                    <Progress.Section value={skill?.manHours.min * 100} color="green" />
                                                    <Progress.Section value={skill?.manHours.avg * 100} color="yellow" />
                                                    <Progress.Section value={skill?.manHours.max * 100} color="red" />
                                                </Progress.Root>
                                            </Card>
                                        ))}
                                    </Box>
                                </ScrollArea>
                            </Accordion.Panel>
                        </Accordion.Item>
                    ))}
                </Accordion>
                    ) : (
                        <Center>
                            <Text>No Data Found </Text>
                            </Center>
                    )
                }
            </ScrollArea>

             {/* Bottom Section: Pagination */}
             {totalPages > 0 && (
                <Center>
                    <Pagination
                        total={totalPages}
                        value={currentPage}
                        onChange={setCurrentPage}
                        size="sm"
                    />
                </Center>
                    
                )}
            </Card>   
            </>
        );
    };

    const FindingAccordion = ({ data }: any) => {
        const [findingSearch, setFindingSearch] = useState("");
        const [activePage, setActivePage] = useState(1);
        const itemsPerPage = 6;
    
        const filteredFindings = data?.filter((finding: any) =>
            finding.taskId.toLowerCase().includes(findingSearch.toLowerCase())
        );
    
        const totalPages = Math.ceil(filteredFindings?.length / itemsPerPage);
        const paginatedFindings = filteredFindings?.slice(
            (activePage - 1) * itemsPerPage,
            activePage * itemsPerPage
        );
    
        return (
            <Card withBorder h="85vh" shadow="sm">
                {/* Top Section: Search Input */}
                <Box >
                    <Text fw={600} size="lg" mb="sm">Findings</Text>
                    <TextInput
                        placeholder="Search Findings by Task ID"
                        value={findingSearch}
                        onChange={(event) => setFindingSearch(event.currentTarget.value)}
                        mb="sm"
                    />
                </Box>
    
                {/* Middle Section: Scrollable Findings List */}
                <ScrollArea h="65vh" scrollbarSize={0} scrollHideDelay={0}>
                    {paginatedFindings?.length > 0 ? (
                        <Accordion variant="separated">
                            {paginatedFindings?.map((finding: any) => (
                                <Accordion.Item key={finding?.taskId} value={finding?.taskId}>
                                    <Accordion.Control
                                    // onClick={()=>handleAccordionChangeFindings(finding?.taskId)}
                                    >
                                        <Group>
                                            <IconAlertTriangle color="#4E66DE" />
                                            {finding?.taskId}
                                        </Group>
                                    </Accordion.Control>
                                    <Accordion.Panel>
                                        <ScrollArea h={400} scrollHideDelay={0}>
                                            <Box p="md">
                                                <SkillsDonutChart task={finding} />
                                                {finding?.skills?.map((skill: any) => (
                                                    <Card key={skill.skill} shadow="0" p="sm" radius='md' mt="xs" bg='#f0f0f0'>
                                                        <Text size="sm" fw={500}>{skill?.skill || "Unknown Skill"}</Text>
                                                        <Group justify="space-between">
                                                            <Text fz="xs" c="green" fw={700}>Min {skill?.manHours?.min} Hr</Text>
                                                            <Text fz="xs" c="yellow" fw={700}>Avg {skill?.manHours?.avg} Hr</Text>
                                                            <Text fz="xs" c="red" fw={700}>Max {skill?.manHours?.max} Hr</Text>
                                                        </Group>
                                                        <Progress.Root>
                                                            <Progress.Section value={skill?.manHours?.min * 100} color="green" />
                                                            <Progress.Section value={skill?.manHours?.avg * 100} color="yellow" />
                                                            <Progress.Section value={skill?.manHours?.max * 100} color="red" />
                                                        </Progress.Root>
                                                    </Card>
                                                ))}
                                            </Box>
                                        </ScrollArea>
                                    </Accordion.Panel>
                                </Accordion.Item>
                            ))}
                        </Accordion>
                    ) : (
                        <Center>
                            <Text>No Findings Found</Text>
                        </Center>
                    )}
                </ScrollArea>
    
                {/* Bottom Section: Pagination */}
                {totalPages > 0 && (
                    <Center >
                        <Pagination 
                            total={totalPages}
                            value={activePage}
                            onChange={setActivePage}
                            size="sm"
                        />
                    </Center>
                )}
            </Card>
        );
    };

    const SkillTaskAccordion = ({ data }: any) => {
        const [skillSearch, setSkillSearch] = useState("");
        const [opened, setOpened] = useState<string | null>(null);
        const [activePage, setActivePage] = useState(1);
        const itemsPerPage = 6;

      
        // Filtering skills based on search input
        const filteredSkills =
          data?.filter((item: any) =>
            item?.skill?.toLowerCase().includes(skillSearch.toLowerCase())
          ) || [];
      
        // Pagination logic
        const totalPages = Math.ceil(filteredSkills?.length / itemsPerPage);
        const paginatedSkills = filteredSkills?.slice(
          (activePage - 1) * itemsPerPage,
          activePage * itemsPerPage
        );
      
        // Reset to page 1 when search input changes
        useEffect(() => {
          setActivePage(1);
        }, [skillSearch]);
      
        return (
          <Card withBorder h="85vh" shadow="sm" p="md" radius="md">
            {/* Top Section: Heading & Search Input */}
            <Box mb="md">
              <Text fw={600} size="lg" mb="sm">
                Skill - Tasks
              </Text>
              <TextInput
                placeholder="Search by Skill Name"
                mb="sm"
                value={skillSearch}
                onChange={(event) => setSkillSearch(event.currentTarget.value)}
              />
            </Box>
      
            {/* Middle Section: Scrollable Accordion List */}
            <ScrollArea h="65vh" scrollbarSize={6}>
              {paginatedSkills?.length > 0 ? (
                <Accordion
                  variant="separated"
                  value={opened}
                  onChange={(value) => {
                    setOpened(value);
                  }}
                >
                  {paginatedSkills?.map((skillGroup: any) => (
                    <Accordion.Item key={skillGroup?.skill} value={skillGroup?.skill}>
                      <Accordion.Control
                    //   onClick={()=>handleAccordionChangeTasks(skillGroup?.skill)}
                      >
                        <Group>
                          <IconCube color="#4E66DE" />
                          <div>
                            <Group>
                              <Text>{skillGroup?.skill}</Text>
                              <Text size="sm" c="dimmed">
                                {skillGroup?.totalTasksCount}
                              </Text>
                            </Group>
                            <Group justify="space-between">
                              <Text size="sm" c="dimmed">
                                Min: {Math.round(skillGroup?.totalMinHours)} Hr
                              </Text>
                              <Text size="sm" c="dimmed">
                                Avg: {Math.round(skillGroup?.totalAvgHours)} Hr
                              </Text>
                              <Text size="sm" c="dimmed">
                                Max: {Math.round(skillGroup?.totalMaxHours)} Hr
                              </Text>
                            </Group>
                          </div>
                        </Group>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <ScrollArea h={300} scrollHideDelay={0}>
                          <Box p="md">
                            {skillGroup?.tasks?.map((task: any) => (
                              <Card key={task.taskId} shadow="0" p="sm" radius="md" mt="xs" bg="#f0f0f0">
                                <Text size="sm" fw={500}>{task.taskId}</Text>
                                <Text size="xs" c="dimmed" mb="xs">{task.taskDescription}</Text>
                                <Group justify="space-between">
                                  <Text fz="xs" c="green" fw={700}>Min {task.manHours.min} Hr</Text>
                                  <Text fz="xs" c="yellow" fw={700}>Avg {task.manHours.avg} Hr</Text>
                                  <Text fz="xs" c="red" fw={700}>Max {task.manHours.max} Hr</Text>
                                </Group>
                                <Progress.Root>
                                  <Progress.Section value={task.manHours.min * 100} color="green" />
                                  <Progress.Section value={task.manHours.avg * 100} color="yellow" />
                                  <Progress.Section value={task.manHours.max * 100} color="red" />
                                </Progress.Root>
                              </Card>
                            ))}
                          </Box>
                        </ScrollArea>
                      </Accordion.Panel>
                    </Accordion.Item>
                  ))}
                </Accordion>
              ) : (
                <Center><Text>No Data Found</Text></Center>
              )}
            </ScrollArea>
      
            {/* Bottom Section: Pagination */}
            {totalPages > 0 && (
              <Center>
                <Pagination value={activePage} onChange={setActivePage} total={totalPages} size="sm" />
              </Center>
            )}
          </Card>
        );
    };

    const SkillFindingAccordion = ({ data }: any) => {
        const [skillSearch, setSkillSearch] = useState("");
        const [currentPage, setCurrentPage] = useState(1);
        const itemsPerPage = 5;
    
        const filteredSkills = data?.filter((item: any) =>
            item?.skill?.toLowerCase().includes(skillSearch?.toLowerCase())
        );
    
        // Pagination logic
        const totalPages = Math.ceil(filteredSkills?.length / itemsPerPage);
        const paginatedData = filteredSkills?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    
        return (
            <Card withBorder h="85vh" shadow="sm" p="md">
                {/* Top Section: Heading & Search */}
                <Box mb="sm">
                    <Text fw={600} size="lg" mb="sm">Skill - Findings</Text>
                    <TextInput
                        placeholder="Search by Skill Name"
                        value={skillSearch}
                        onChange={(event) => setSkillSearch(event.currentTarget.value)}
                    />
                </Box>
    
                {/* Middle Section: Scrollable Accordion */}
                <ScrollArea h="65vh" scrollbarSize={6} scrollHideDelay={0}>
                    {paginatedData?.length > 0 ? (
                        <Accordion variant="separated">
                            {paginatedData?.map((skillGroup: any) => (
                                <Accordion.Item key={skillGroup?.skill} value={skillGroup?.skill}>
                                    <Accordion.Control
                                    // onClick={()=>handleAccordionChangeFindings(skillGroup?.skill)}
                                    >
                                        <Group>
                                            <IconAlertTriangle color="#4E66DE" />
                                            <div>
                                                <Group>
                                                    <Text>{skillGroup?.skill}</Text>
                                                    <Text size="sm" c="dimmed">
                                                        {/* {skillGroup?.findings?.length} findings */}
                                                        {skillGroup?.totalTasksCount}
                                                        </Text>
                                                </Group>
                                                <Group justify="space-between">
                                                    <Text size="sm" c="dimmed">Min: {Math.round(skillGroup?.totalMinHours)} Hr</Text>
                                                    <Text size="sm" c="dimmed">Avg: {Math.round(skillGroup?.totalAvgHours)} Hr</Text>
                                                    <Text size="sm" c="dimmed">Max: {Math.round(skillGroup?.totalMaxHours)} Hr</Text>
                                                </Group>
                                            </div>
                                        </Group>
                                    </Accordion.Control>
                                    <Accordion.Panel>
                                        <ScrollArea h={300} scrollHideDelay={0}>
                                            <Box p="md">
                                                {skillGroup?.findings?.map((finding: any) => (
                                                    <Card key={finding?.taskId} shadow="0" p="sm" radius='md' mt="xs" bg='#f0f0f0'>
                                                        <Text size="sm" fw={500}>{finding?.taskId || "-"}</Text>
                                                        <Group justify="space-between">
                                                            <Text fz="xs" c="green" fw={700}>Min {finding?.manHours?.min} Hr</Text>
                                                            <Text fz="xs" c="yellow" fw={700}>Avg {finding?.manHours?.avg} Hr</Text>
                                                            <Text fz="xs" c="red" fw={700}>Max {finding?.manHours?.max} Hr</Text>
                                                        </Group>
                                                        <Progress.Root>
                                                            <Progress.Section value={finding?.manHours?.min * 100} color="green" />
                                                            <Progress.Section value={finding?.manHours?.avg * 100} color="yellow" />
                                                            <Progress.Section value={finding?.manHours?.max * 100} color="red" />
                                                        </Progress.Root>
                                                    </Card>
                                                ))}
                                            </Box>
                                        </ScrollArea>
                                    </Accordion.Panel>
                                </Accordion.Item>
                            ))}
                        </Accordion>
                    ) : (
                        <Center><Text>No Data Found</Text></Center>
                    )}
                </ScrollArea>
    
                {/* Bottom Section: Pagination */}
                {totalPages > 0 && (
                    <Center>
                        <Pagination size="sm" value={currentPage} onChange={setCurrentPage} total={totalPages} />
                    </Center>
                )}
            </Card>
        );
    };

    return (
        <>
            <SimpleGrid cols={4} pt={10}>
                <Card withBorder radius='md' bg='#e1e6f7'>
                    <Group gap='lg' justify="space-between">
                        <Flex direction='column'>
                            <Text fw={400} fz='sm'>Source Tasks</Text>
                            <Text fw={600} fz='h2'>{skillAnalysisData?.skillAnalysis?.overallAggregated?.overallTasks || 0}</Text>
                            {/* <Text fw={600} fz='h2'>{skillAnalysisData?.skillAnalysis?.tasks?.length || 0}</Text> */}
                        </Flex>
                        <IconCube color="#4E66DE" size='39' />
                    </Group>
                    {/* <Text fw={500} fz='sm' c='dimmed'>skills - {totalTaskSkills || 0}</Text> */}
                </Card>
                <Card withBorder radius='md' bg='#d2fad4'>
                    <Group gap='lg' justify="space-between">
                        <Flex direction='column'>
                            <Text fw={400} fz='sm'>Tasks Avg Time</Text>
                            <Text fw={600} fz='h2'>{skillAnalysisData?.skillAnalysis?.overallAggregated?.overallTasksAvgTime || 0}</Text>
                            {/* <Text fw={600} fz='h2'>{totalAvgTimeTasks || 0} Hr</Text> */}
                        </Flex>
                        <IconClock color="green" size='39' />
                    </Group>
                </Card>
                <Card withBorder radius='md' bg='#fcebf9'>
                    <Group gap='lg' justify="space-between">
                        <Flex direction='column'>
                            <Text fw={400} fz='sm'>Findings</Text>
                            <Text fw={600} fz='h2'>{skillAnalysisData?.skillAnalysis?.overallAggregated?.overallFindings || 0}</Text>
                            {/* <Text fw={600} fz='h2'>{skillAnalysisData?.skillAnalysis?.findings?.length || 0}</Text> */}
                        </Flex>
                        <IconAlertTriangle color="red" size='39' />
                    </Group>
                    {/* <Text fw={500} fz='sm' c='dimmed'>skills - {totalFindingSkills || 0}</Text> */}
                </Card>
                <Card withBorder radius='md' bg='#FFEDE2'>
                    <Group gap='lg' justify="space-between">
                        <Flex direction='column'>
                            <Text fw={400} fz='sm'>Findings Avg Time</Text>
                            <Text fw={600} fz='h2'>{skillAnalysisData?.skillAnalysis?.overallAggregated?.overallFindingsAvgTime || 0}</Text>
                            {/* <Text fw={600} fz='h2'>{totalAvgTimeFindings || 0} Hr</Text> */}
                        </Flex>
                        <IconClock color="orange" size='39' />
                    </Group>
                </Card>
            </SimpleGrid>
            <Space h='sm' />
            <SimpleGrid cols={2}>
                {/* <Card withBorder h={skillAnalysisData !== null ? '85vh' : '40vh'} shadow="sm">
                    <ScrollArea h='85vh' scrollbarSize={0} scrollHideDelay={0}>
                        <Text fw={600} size="lg" mb="sm">Skill - Tasks</Text> */}
                        <SkillTaskAccordion data={skillAnalysisData?.skillAnalysis?.skillWiseTasks} />
                        {/* {
                        skillAnalysisData === null ? (
                            <Center>
                            <Text>No Data Found </Text>
                            </Center>
                        ) : (
                            <></>
                        )
                    }
                    </ScrollArea>
                </Card> */}
                {/* <Card withBorder h={skillAnalysisData !== null ? '85vh' : '40vh'} shadow="sm">
                    <ScrollArea h='85vh' scrollbarSize={0} scrollHideDelay={0}>
                        <Text fw={600} size="lg" mb="sm">Skill - Findings</Text> */}
                        <SkillFindingAccordion data={skillAnalysisData?.skillAnalysis?.skillWiseFindings} />
                        {/* {
                        skillAnalysisData === null ? (
                            <Center>
                            <Text>No Data Found </Text>
                            </Center>
                        ) : (
                            <></>
                        )
                    }
                    </ScrollArea>
                </Card> */}
            </SimpleGrid>
            
            <Space h='sm' />
            <SimpleGrid cols={2}>
                {/* <Card withBorder h={skillAnalysisData !== null ? '85vh' : '40vh'} shadow="sm">
                    <ScrollArea h='85vh' scrollbarSize={0} scrollHideDelay={0}>
                        <Text fw={600} size="lg" mb="sm">MPD</Text> */}
                        <TaskAccordion data={skillAnalysisData?.skillAnalysis?.tasks} />
                        {/* {
                        skillAnalysisData === null ? (
                            <Center>
                            <Text>No Data Found </Text>
                            </Center>
                        ) : (
                            <></>
                        )
                    }
                    </ScrollArea>
                    
                </Card> */}
                {/* <Card withBorder h={skillAnalysisData !== null ? '85vh' : '40vh'} shadow="sm">
                    <ScrollArea h='85vh' scrollbarSize={0} scrollHideDelay={0}>
                        <Text fw={600} size="lg" mb="sm">Findings</Text> */}
                        <FindingAccordion data={skillAnalysisData?.skillAnalysis?.findings} />
                        {/* {
                        skillAnalysisData === null ? (
                            <Center>
                            <Text>No Data Found </Text>
                            </Center>
                        ) : (
                            <></>
                        )
                    }
                    </ScrollArea>
                </Card> */}
            </SimpleGrid>
            
            
        </>
    );
};

export default SkillRequirementAnalyticsNew;