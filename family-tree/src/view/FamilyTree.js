import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const FamilyTree = () => {
    const [data, setData] = useState(null);
    const svgRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                setData(jsonData);
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        };
        reader.readAsText(file);
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    useEffect(() => {
        if (data) {
            drawTree(data);
        }
    }, [data]);

    const drawTree = (rootData) => {
        const width = 1200;
        const height = 800;
        const svg = d3.select(svgRef.current);

        svg.selectAll('*').remove();
        svg.attr('width', width).attr('height', height);

        const treeLayout = d3.tree().size([width - 200, height - 200]);
        const root = d3.hierarchy(rootData);
        treeLayout(root);

        const links = svg.selectAll('.link')
            .data(root.links())
            .enter()
            .append('line')
            .attr('class', 'link')
            .attr('x1', d => d.source.x + 100)
            .attr('y1', d => d.source.y + 100)
            .attr('x2', d => d.target.x + 100)
            .attr('y2', d => d.target.y + 100);

        const nodes = svg.selectAll('.node')
            .data(root.descendants())
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.x + 100},${d.y + 100})`);

        nodes.append('image')
            .attr('xlink:href', d => d.data.image || '/images/default.jpg')
            .attr('x', -30)
            .attr('y', -30)
            .attr('width', 60)
            .attr('height', 60)
            .attr('clip-path', 'url(#clip)');

        svg.append('defs')
            .append('clipPath')
            .attr('id', 'clip')
            .append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 30);

        const details = nodes.append('g')
            .attr('class', 'details')
            .attr('transform', 'translate(80, 0)');

        details.append('text')
            .attr('dy', 0)
            .text(d => `${d.data.name}`)
            .style('font-size', '12px')
            .style('fill', '#000');

        details.append('text')
            .attr('dy', 15)
            .text(d => d.depth > 0 ? `Relation: ${d.data.relationship || ''}` : '')
            .style('font-size', '10px')
            .style('fill', 'gray');

        details.append('text')
            .attr('dy', 30)
            .text(d => d.data.age ? `Age: ${d.data.age}` : '')
            .style('font-size', '10px')
            .style('fill', 'gray');
    };

    return (
        <div>
            <h2>Family Tree Viewer</h2>
            <button className='btn btn-success mt-3 mb-3' onClick={triggerFileInput}>Upload Family JSON</button>
            <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                className="hidden-file-input"
                onChange={handleFileUpload}
            />
            {!data && <div className="no-data-message">Nothing added</div>}
            <svg ref={svgRef}></svg>
        </div>
    );
};

export default FamilyTree;
