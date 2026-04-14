# Lost and Found Report Portal

LFRP provides a portal for users to post about their lost items or items they
may have found across the campus similar to making a social media post. LFRP
improves everyone's chances at finding their lost belongings massively by
offloading ton of manual, offline work to an always online solution.

---

| Details      |                          |
| ------------ | ------------------------ |
| Developed By | Meet Patel (22171341115) |
| Semester     | 6th                      |
| Under        | Prof Sanjay Chaudhary    |


### Rest Endpoints in this project

| HTTP Method | Endpoint | Used for | Auth required |
| --------------- | --------------- | --------------- | --------------- |
| `GET` | `/ping` | Ping server to check if it's running or not | Yes |
| `GET` | `/api/post` | Get all the user created post | Yes |
| `POST` | `/api/post` | Create a new post | Yes |
| `PUT` | `/api/post/:id` | Update a post's content | Yes |
| `DELETE` | `/api/post/:id` | Delete a post | Yes |
| `GET` | `/api/auth/register` | Register for an account | No |
| `GET` | `/api/auth/login` | Log in to your account | No |

### Authorization

For endpoints that require authorization, the auth token must set by the
following HTTP header
```
Authorization: Bearer eyJxxxxxxxxxxxxxxxxxxxmSo
```
