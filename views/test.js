else { %>
      
  <h4>&nbsp;</h4>
  <h4>&nbsp;&nbsp;&nbsp; 🌸🌸Welcome.Please Register or Login.&nbsp;&nbsp;🌸🌸</h4>

<% } %>


</thead>
      <tbody>
        <% if(!user) { %>
          <div>
            <h4>&nbsp;&nbsp;&nbsp; 🌸🌸&nbsp;Welcome.Please Register or Login.&nbsp;🌸🌸</h4>
            <!-- <p> -->
            <!-- </p>  -->
          </div>
        <% } else {%>
        <% for(let url in urls) { %>
          <tr>
            <td><a href='/urls/<%= url %>'></ahref><%= url %></a></td>
            <td><%= urls[url].longURL %></td>
            <td><%= urls[url] %></td>
            <td><form method="GET" action="/urls/<%= url %>/"><button type="submit">Edit</button></form></td>
            <td><form method="POST" action="/urls/<%= url %>/delete"><button type="submit">Delete</button></form></td>
          </tr>
        <% }} %>
      </tbody>
    </table>
  </main>